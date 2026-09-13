import { randomUUID } from 'node:crypto';
import { AppError } from './errors.js';
import { scoreQuiz } from '../shared/scoring.js';
import { validate, validateQuizSources } from './validation.js';
const now = () => new Date().toISOString();
const json = JSON.stringify;

export function createStore(db) {
  const store = {
    ensureUser(id) { db.prepare('INSERT OR IGNORE INTO users VALUES (?,?)').run(id,now()); },
    addModule(m,userId=null,runId=null) {
      validate('module',m);
      db.prepare('INSERT INTO modules VALUES (?,?,?,?,?,?,?,?,?)').run(m.module_id,m.version,userId,m.area,m.metric,json(m),json(m.sources),runId,now());
      return m;
    },
    module(id,version,userId) {
      const row=db.prepare('SELECT * FROM modules WHERE module_id=? AND version=? AND (user_id IS NULL OR user_id=?)').get(id,version,userId);
      if (!row) throw new AppError('not_found','Módulo no disponible.',404);
      return JSON.parse(row.content_json);
    },
    modules(userId) { return db.prepare('SELECT content_json FROM modules WHERE user_id IS NULL OR user_id=? ORDER BY created_at,rowid').all(userId).map(r=>JSON.parse(r.content_json)); },
    addQuiz(q,moduleVersion,userId,runId=null) {
      validate('quiz',q);
      validateQuizSources(q,store.module(q.module_id,moduleVersion,userId));
      db.prepare('INSERT INTO quizzes VALUES (?,?,?,?,?,?,?,?)').run(q.quiz_id,q.module_id,moduleVersion,userId,q.version,json(q),runId,now());
      return q;
    },
    quiz(id,userId) {
      const row=db.prepare('SELECT * FROM quizzes WHERE quiz_id=? AND user_id=?').get(id,userId);
      if (!row) throw new AppError('not_found','Quiz no disponible.',404);
      return {...row,quiz:JSON.parse(row.quiz_json)};
    },
    lastQuiz(moduleId,userId) {
      const row=db.prepare('SELECT quiz_json FROM quizzes WHERE module_id=? AND user_id=? ORDER BY rowid DESC LIMIT 1').get(moduleId,userId);
      return row?JSON.parse(row.quiz_json):null;
    },
    saveAttempt: db.transaction((userId,quizId,answers) => {
      const q=store.quiz(quizId,userId).quiz;
      let result;
      try { result=scoreQuiz(q,answers); } catch(e) { throw new AppError('invalid_answers',e.message); }
      const old=db.prepare('SELECT * FROM attempts WHERE user_id=? AND quiz_id=?').get(userId,quizId);
      if (old) {
        if (old.answers_json!==json(answers)) throw new AppError('attempt_locked','Este quiz ya fue respondido. Iniciá otro intento.',409);
        return store.attempt(old.attempt_id,userId);
      }
      const id=randomUUID();
      db.prepare('INSERT INTO attempts VALUES (?,?,?,?,?,?,?,?)').run(id,userId,quizId,json(answers),json(result.results),result.score,result.correct_count,now());
      return store.attempt(id,userId);
    }),
    attempt(id,userId) {
      const row=db.prepare('SELECT * FROM attempts WHERE attempt_id=? AND user_id=?').get(id,userId);
      if (!row) throw new AppError('not_found','Intento no disponible.',404);
      return {attempt_id:row.attempt_id,user_id:row.user_id,quiz_id:row.quiz_id,answers:JSON.parse(row.answers_json),
        results:JSON.parse(row.results_json),score:row.score,correct_count:row.correct_count,created_at:row.created_at};
    },
    progress(userId,area=null,metric=null) {
      const rows=db.prepare(`SELECT a.*,q.module_id,q.module_version,q.quiz_json,m.area,m.metric
        FROM attempts a JOIN quizzes q ON q.quiz_id=a.quiz_id
        JOIN modules m ON m.module_id=q.module_id AND m.version=q.module_version
        WHERE a.user_id=? AND (? IS NULL OR m.area=? COLLATE NOCASE) AND (? IS NULL OR m.metric=? COLLATE NOCASE)
        ORDER BY a.created_at,a.rowid`).all(userId,area,area,metric,metric);
      const groups=new Map();
      const history=rows.map(r=>{
        const key=json([r.area,r.metric]);
        const g=groups.get(key)||{area:r.area,metric:r.metric,attempts:0,last_score:0,best:0};
        g.attempts++;g.last_score=r.score;g.best=Math.max(g.best,r.score);groups.set(key,g);
        return {...store.attempt(r.attempt_id,userId),module_id:r.module_id,module_version:r.module_version,
          area:r.area,metric:r.metric,quiz:JSON.parse(r.quiz_json)};
      });
      return {user_id:userId,summary:[...groups.values()],history};
    },
    startRun(row) {
      db.prepare('INSERT INTO agent_runs VALUES (?,?,?,?,?,?,?,?,?,?,?)').run(row.run_id,row.user_id,row.operation,row.model,row.prompt_version,json(row.input),'[]','null','running',null,now());
    },
    finishRun(id,calls,output,status,error=null) {
      db.prepare('UPDATE agent_runs SET tool_calls_json=?,output_json=?,status=?,error=? WHERE run_id=?').run(json(calls),json(output),status,error,id);
    },
    addRoute(route,userId,runId) {
      validate('route',route);
      db.prepare('INSERT INTO routes VALUES (?,?,?,?,?)').run(route.route_id,userId,json(route),runId,now());return route;
    },
    decision(userId,runId,decision) {
      const run=db.prepare('SELECT run_id FROM agent_runs WHERE run_id=? AND user_id=? AND status=?').get(runId,userId,'completed');
      if (!run) throw new AppError('not_found','Recomendación no disponible.',404);
      db.prepare('INSERT INTO decisions VALUES (?,?,?,?,?)').run(randomUUID(),userId,runId,decision,now());
    },
    snapshot(userId) {
      const decode=(r)=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,k.endsWith('_json')?JSON.parse(v):v]));
      return {exported_at:now(),kind:'reconstruction',user_id:userId,
        modules:db.prepare('SELECT * FROM modules WHERE user_id IS NULL OR user_id=?').all(userId).map(decode),
        quizzes:db.prepare('SELECT * FROM quizzes WHERE user_id=?').all(userId).map(decode),
        attempts:db.prepare('SELECT * FROM attempts WHERE user_id=?').all(userId).map(decode),
        agent_runs:db.prepare('SELECT * FROM agent_runs WHERE user_id=?').all(userId).map(decode),
        routes:db.prepare('SELECT * FROM routes WHERE user_id=?').all(userId).map(decode),
        decisions:db.prepare('SELECT * FROM decisions WHERE user_id=?').all(userId).map(decode)};
    }
  };
  return store;
}
