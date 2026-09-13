import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scoreQuiz } from '../shared/scoring.js';
import { freezeQuiz,selectSeed,shuffle } from '../server/quizzes.js';
import { validate,parseEnvelope } from '../server/validation.js';
import { openDatabase } from '../server/database.js';
import { createStore } from '../server/store.js';
import { setup } from './helpers.js';
const seeds=JSON.parse(fs.readFileSync(new URL('../data/seeds.json',import.meta.url)));

test('Schemas validate all seed modules and reject invalid quiz dimensions/keys',()=>{
  for(const s of seeds) validate('module',s.module);
  const q=freezeQuiz('throughput',seeds[0].questions.slice(0,5));validate('quiz',q);
  for(const mutate of [q=>q.questions.pop(),q=>q.questions[0].options.pop(),q=>q.questions[0].correct_option=4,q=>delete q.questions[0].explanation]) {
    const bad=structuredClone(q);mutate(bad);assert.throws(()=>validate('quiz',bad));
  }
  assert.throws(()=>parseEnvelope('module','null'));
});
test('Scores reproducibly cover 0,20,40,60,80,100; invalid answers rejected',()=>{
  const q=freezeQuiz('throughput',seeds[0].questions.slice(0,5));
  for(let n=0;n<=5;n++) {
    const answers=q.questions.map((p,i)=>i<n?p.correct_option:(p.correct_option+1)%4);
    assert.equal(scoreQuiz(q,answers).score,n*20);
    assert.deepEqual(scoreQuiz(q,answers),scoreQuiz(q,answers));
  }
  assert.throws(()=>scoreQuiz(q,[0,0,0,0,8]));
});
test('Option shuffle preserves correct answer text and does not mutate input',()=>{
  const source=seeds[0].questions.slice(0,5),copy=structuredClone(source);
  const q=freezeQuiz('throughput',source);
  for(const p of q.questions) {const old=source.find(s=>s.question_id===p.question_id);assert.equal(p.options[p.correct_option],old.options[old.correct_option]);}
  assert.deepEqual(source,copy);
  assert.deepEqual(shuffle([0,1,2,3],()=>0),[1,2,3,0]);
});
test('Seed second quiz includes unused question, never repeats full previous set',()=>{
  const bank=seeds[0].questions,first=freezeQuiz('throughput',selectSeed(bank,null));
  const second=selectSeed(bank,first);
  assert(second.some(q=>!first.questions.some(p=>p.question_id===q.question_id)));
});
test('Server starts; frontend served; secrets and internal files never served',async t=>{
  const f=await setup(t);
  assert.equal((await f.request('/api/health')).status,200);
  const home=await fetch(f.base);assert.equal(home.status,200);assert.match(await home.text(),/view-study/);
  for(const url of ['/.env','/.git/config','/server/agent.js','/db/metricamente.db','/node_modules/openai/package.json','/data/seeds.json','/prompts/system_prompt.md']) assert.equal((await fetch(f.base+url)).status,404,url);
  assert.equal((await f.request('/api/modules')).body.modules.length,5);
});
test('Attempt persisted, server ignores supplied score, repeat submit idempotent, edit denied',async t=>{
  const f=await setup(t),q=(await f.request('/api/learning/quiz',{module_id:'throughput',version:1})).body.data;
  const answers=q.questions.map((q,i)=>i<3?q.correct_option:(q.correct_option+1)%4);
  const a=await f.request('/api/attempts',{quiz_id:q.quiz_id,answers,score:100});
  assert.equal(a.body.data.score,60);
  const again=await f.request('/api/attempts',{quiz_id:q.quiz_id,answers});assert.equal(again.body.data.attempt_id,a.body.data.attempt_id);
  assert.equal((await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:[...answers.slice(0,4),(answers[4]+1)%4]})).status,409);
  const progress=(await f.request(`/api/progress/${f.user}`)).body;
  assert.equal(progress.summary[0].attempts,1);assert.deepEqual(progress.history[0].quiz,q);
  assert.throws(()=>f.db.prepare('UPDATE attempts SET score=100').run(),/immutable/);
  assert.throws(()=>f.db.prepare('DELETE FROM quizzes').run(),/immutable/);
});
test('No cross-user attempt, module or progress access; rejects mismatching identity',async t=>{
  const f=await setup(t),q=(await f.request('/api/learning/quiz',{module_id:'throughput',version:1})).body.data,other=randomUUID();
  assert.equal((await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:[0,0,0,0,0]},other)).status,404);
  assert.equal((await f.request(`/api/progress/${f.user}`,undefined,other)).status,403);
  assert.equal((await f.request('/api/attempts',{user_id:other})).status,403);
});
test('Explicit validation, missing key and failed feedback preserve saved attempt',async t=>{
  const f=await setup(t);
  assert.equal((await f.request('/api/learning/module',{})).status,400);
  const q=(await f.request('/api/learning/quiz',{module_id:'sla',version:1})).body.data;
  assert.equal((await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:[0]})).status,400);
  const attempt=(await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:[0,0,0,0,0]})).body.data;
  const feedback=await f.request('/api/learning/feedback',{attempt_id:attempt.attempt_id});
  assert.equal(feedback.status,503);assert.equal(feedback.body.status,'configuration_required');
  assert.equal((await f.request(`/api/progress/${f.user}`)).body.history.length,1);
  assert.equal(f.db.prepare('SELECT status FROM agent_runs').get().status,'failed');
});
test('Database write failure never reports saved result',async t=>{
  const f=await setup(t),q=(await f.request('/api/learning/quiz',{module_id:'sla',version:1})).body.data;
  f.db.pragma('query_only=ON');
  const r=await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:[0,0,0,0,0]});
  assert.equal(r.status,503);assert.equal(r.body.status,'database_error');
  f.db.pragma('query_only=OFF');assert.equal(f.store.progress(f.user).history.length,0);
});
test('SQLite survives close/reopen; snapshot reconstructs frozen artifacts',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'metricamente-test-')),filename=path.join(dir,'test.db');
  let db=openDatabase(filename);
  try {
    let store=createStore(db);const user=randomUUID();store.ensureUser(user);store.addModule(seeds[0].module);
    const q=freezeQuiz('throughput',seeds[0].questions.slice(0,5));store.addQuiz(q,1,user);
    const a=store.saveAttempt(user,q.quiz_id,q.questions.map(q=>q.correct_option));
    db.close();db=openDatabase(filename);store=createStore(db);
    const snapshot=store.snapshot(user);
    assert.equal(snapshot.attempts[0].score,100);assert.equal(snapshot.attempts[0].attempt_id,a.attempt_id);
    assert.deepEqual(snapshot.quizzes[0].quiz_json,q);
    assert.equal(scoreQuiz(snapshot.quizzes[0].quiz_json,snapshot.attempts[0].answers_json).score,100);
  } finally {db.close();fs.rmSync(dir,{recursive:true});}
});

test('Export command creates separate snapshots with reconstructible scores; no overwrite',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'metricamente-export-')),filename=path.join(dir,'test.db');
  const db=openDatabase(filename);const user=randomUUID();
  try {
    const store=createStore(db);store.ensureUser(user);store.addModule(seeds[0].module);
    const q=freezeQuiz('throughput',seeds[0].questions.slice(0,5));store.addQuiz(q,1,user);store.saveAttempt(user,q.quiz_id,[0,0,0,0,0]);
    for(let i=0;i<2;i++) {
      const run=spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/export-run.js',import.meta.url)),user],{cwd:dir,env:{...process.env,DATABASE_PATH:filename},encoding:'utf8'});
      assert.equal(run.status,0,run.stderr);
    }
    const files=fs.readdirSync(path.join(dir,'corridas'));assert.equal(files.length,2);
    const snapshot=JSON.parse(fs.readFileSync(path.join(dir,'corridas',files[0]),'utf8'));
    assert.equal(snapshot.kind,'reconstruction');assert.equal(snapshot.attempts.length,1);
    assert.equal(scoreQuiz(snapshot.quizzes[0].quiz_json,snapshot.attempts[0].answers_json).score,snapshot.attempts[0].score);
  } finally {db.close();fs.rmSync(dir,{recursive:true});}
});
