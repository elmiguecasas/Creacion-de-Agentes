import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { openDatabase } from './database.js';
import { createStore } from './store.js';
import { createAgent } from './agent.js';
import { AppError } from './errors.js';
import { freezeQuiz,selectSeed } from './quizzes.js';

const root=fileURLToPath(new URL('../',import.meta.url));
const seeds=JSON.parse(fs.readFileSync(path.join(root,'data/seeds.json'),'utf8'));
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const string=(v,name,max=200)=>{
  if(typeof v!=='string'||!v.trim()||v.length>max) throw new AppError('invalid_request',`${name} es obligatorio (máximo ${max} caracteres).`);
  return v.trim();
};
const version=v=>{ if(!Number.isInteger(v)||v<1) throw new AppError('invalid_request','Versión inválida.'); return v; };

export function createApp({databasePath=process.env.DATABASE_PATH||path.join(root,'db/metricamente.db'),agentOptions={}}={}) {
  const db=openDatabase(databasePath);
  const store=createStore(db);
  db.transaction(()=>{ for(const seed of seeds) if(!db.prepare('SELECT 1 FROM modules WHERE module_id=? AND version=1').get(seed.module.module_id)) store.addModule(seed.module); })();
  const agent=createAgent(store,agentOptions);
  const app=express();
  app.disable('x-powered-by');
  app.use((req,res,next)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
    if(req.headers.origin && req.headers.origin!==`${req.protocol}://${req.get('host')}`) return next(new AppError('origin_denied','Origen no permitido.',403));
    next();
  });
  app.use(express.json({limit:'32kb'}));
  app.get('/api/health',(_req,res)=>{db.prepare('SELECT 1').get();res.json({status:'ok',agent_configured:agent.configured});});
  app.use('/api',(req,res,next)=>{
    const id=req.get('X-User-Id');
    if(!uuid.test(id||'')) return next(new AppError('invalid_user','Falta una identidad local válida.',400));
    if(req.body?.user_id && req.body.user_id!==id) return next(new AppError('user_mismatch','La identidad no coincide.',403));
    store.ensureUser(id);req.userId=id;res.setHeader('Cache-Control','no-store');next();
  });
  const active=new Set();
  const run=async(op,user,data)=>{
    if(active.has(user)) throw new AppError('busy','Ya hay una solicitud en curso. Esperá a que termine.',429);
    active.add(user);try{return await agent.run(op,user,data);}finally{active.delete(user);}
  };
  app.get('/api/modules',(req,res)=>res.json({modules:store.modules(req.userId)}));
  app.get('/api/progress/:userId',(req,res)=>{
    if(req.params.userId!==req.userId) throw new AppError('user_mismatch','La identidad no coincide.',403);
    const area=req.query.area===undefined?null:string(req.query.area,'area');
    const metric=req.query.metric===undefined?null:string(req.query.metric,'metric');
    res.json(store.progress(req.userId,area,metric));
  });
  app.post('/api/learning/interpret',async(req,res)=>{
    res.json(await run('interpret',req.userId,{intent:string(req.body?.intent,'intención',2000),preferred_mode:['metric','area'].includes(req.body?.mode)?req.body.mode:null}));
  });
  app.post('/api/learning/module',async(req,res)=>{
    const result=await run('module',req.userId,{intent:string(req.body?.intent,'intención',2000),area:req.body.area?string(req.body.area,'área'):null,module_id:randomUUID(),version:1});
    store.addModule(result.data,req.userId,result.run_id);res.status(201).json(result);
  });
  app.post('/api/learning/route',async(req,res)=>{
    const result=await run('route',req.userId,{intent:string(req.body?.intent,'intención',2000),route_id:randomUUID()});
    store.addRoute(result.data,req.userId,result.run_id);res.status(201).json(result);
  });
  app.post('/api/learning/quiz',async(req,res)=>{
    const module=store.module(string(req.body?.module_id,'módulo'),version(req.body?.version),req.userId);
    const previous=store.lastQuiz(module.module_id,req.userId);
    const seed=seeds.find(s=>s.module.module_id===module.module_id && module.version===1);
    let questions,runId=null;
    if(seed) questions=selectSeed(seed.questions,previous);
    else {
      const generated=await run('quiz',req.userId,{module,quiz_id:randomUUID(),version:1,previous_quiz:previous});
      questions=generated.data.questions;runId=generated.run_id;
    }
    const quiz=freezeQuiz(module.module_id,questions);
    store.addQuiz(quiz,module.version,req.userId,runId);
    res.status(201).json({data:quiz,run_id:runId});
  });
  app.post('/api/attempts',(req,res)=>{
    // Client scores and answer keys are never read. Correct from the frozen server artifact.
    const attempt=store.saveAttempt(req.userId,string(req.body?.quiz_id,'quiz'),req.body?.answers);
    res.json({data:attempt});
  });
  app.post('/api/learning/feedback',async(req,res)=>{
    const attempt=store.attempt(string(req.body?.attempt_id,'intento'),req.userId);
    const q=store.quiz(attempt.quiz_id,req.userId);
    res.json(await run('feedback',req.userId,{attempt,quiz:q.quiz,module:store.module(q.module_id,q.module_version,req.userId)}));
  });
  app.post('/api/decisions',(req,res)=>{
    if(!['accept','reject'].includes(req.body?.decision)) throw new AppError('invalid_request','Decisión inválida.');
    store.decision(req.userId,string(req.body.run_id,'ejecución'),req.body.decision);res.json({status:'recorded'});
  });
  // Explicit allowlist: never serve repository root, .env, database, logs, prompts or node_modules.
  for(const [url,file] of Object.entries({'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js','/shared/scoring.js':'shared/scoring.js'})) {
    app.get(url,(_req,res)=>res.sendFile(path.join(root,file)));
  }
  app.use((_req,_res,next)=>next(new AppError('not_found','Recurso no disponible.',404)));
  app.use((err,_req,res,_next)=>{
    const isDb=String(err.code||'').startsWith('SQLITE');
    const code=isDb?'database_error':err.type==='entity.parse.failed'?'invalid_json':err.type==='entity.too.large'?'request_too_large':err.code||'internal_error';
    res.status(isDb?503:err.status||500).json({status:code,message:isDb?'La base de datos no pudo completar la operación. No se confirmó el guardado.':err instanceof AppError?err.message:'No se pudo completar la operación.',run_id:err.run_id||null});
  });
  return {app,db,store,agent};
}
