import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID,createHash } from 'node:crypto';
import { openDatabase } from '../server/database.js';
import { createStore } from '../server/store.js';
const userId=process.argv[2];
if(!userId) throw new Error('Uso: npm run export:run -- <user-id>');
const filename=process.env.DATABASE_PATH||'./db/metricamente.db';
if(!fs.existsSync(filename)) throw new Error('No existe la base indicada. No se exportaron datos.');
const db=openDatabase(filename);
try {
  if(!db.prepare('SELECT 1 FROM users WHERE user_id=?').get(userId)) throw new Error('Usuario no encontrado.');
  const snapshot=createStore(db).snapshot(userId);
  const content=JSON.stringify(snapshot,null,2)+'\n';
  fs.mkdirSync('corridas',{recursive:true});
  const target=path.join('corridas',`${new Date().toISOString().replace(/[:.]/g,'-')}-${randomUUID()}.json`);
  fs.writeFileSync(target,content,{flag:'wx'});
  console.log(JSON.stringify({file:target,sha256:createHash('sha256').update(content).digest('hex'),runs:snapshot.agent_runs.length,attempts:snapshot.attempts.length}));
} finally {db.close();}
