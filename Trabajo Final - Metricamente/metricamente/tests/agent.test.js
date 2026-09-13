import test from 'node:test';
import assert from 'node:assert/strict';
import { setup,fixtureClient } from './helpers.js';
import { redactEvidence } from '../server/agent.js';

test('Fixture-only: actual dispatcher reads SQLite, calls search, validates module and records exact requests',async t=>{
  const client=fixtureClient(),f=await setup(t,{client});
  const result=await f.request('/api/learning/module',{intent:'CAC'});assert.equal(result.status,201);
  assert.equal(client.calls.length,3);assert.equal(client.calls[1].config.tools[0].functionDeclarations[0].name,'search_metric_sources');
  assert.equal(client.calls[2].config.responseMimeType,'application/json');
  assert(client.calls[2].config.responseJsonSchema);
  const trace=JSON.parse(f.db.prepare('SELECT tool_calls_json FROM agent_runs').get().tool_calls_json);
  assert.equal(trace[1].name,'get_learning_progress');assert.equal(trace[1].output.user_id,f.user);
  assert.equal(trace[0].request.contents.length,1,'request snapshot must not change when later messages append');
  assert.equal(trace[0].response.candidates[0].content.parts[0].functionCall.name,'get_learning_progress');
  assert.equal(trace[3].output.query,'fixture query');
  assert.equal(trace[3].output.results[0].content,'Fixture evidence; not a real web search.');
  assert.deepEqual(trace[3].usage,{credits:1});
  assert.equal(client.calls[2].contents.find(m=>m.parts?.[0]?.functionResponse?.name==='search_metric_sources').parts[0].functionResponse.response.result.query,'fixture query');
  assert.equal(trace[2].usage_metadata.totalTokenCount,2);
  assert.deepEqual(redactEvidence({apiKey:'fixture-secret',message:'fixture-secret echoed'},'fixture-secret'),{apiKey:'[REDACTED]',message:'[REDACTED] echoed'});
  assert.deepEqual(redactEvidence({message:'fixture-tavily fixture-gemini',TAVILY_API_KEY:'hidden'},['fixture-tavily','fixture-gemini']),{message:'[REDACTED] [REDACTED]',TAVILY_API_KEY:'[REDACTED]'});
  assert.throws(()=>f.db.prepare("UPDATE agent_runs SET status='running'").run(),/immutable/);
});
test('Fixture-only: route is proposal, no attempts created; human decision recorded',async t=>{
  const f=await setup(t,{client:fixtureClient()});
  const route=await f.request('/api/learning/route',{intent:'RRHH'});assert.equal(route.status,201);
  assert.equal(f.store.progress(f.user).history.length,0);
  assert.equal((await f.request('/api/decisions',{run_id:route.body.run_id,decision:'reject'})).status,200);
  assert.equal(f.db.prepare('SELECT decision FROM decisions').get().decision,'reject');
});
test('Fixture-only: new module -> generated frozen quiz -> attempt -> feedback uses official score',async t=>{
  const client=fixtureClient(),f=await setup(t,{client});
  const m=(await f.request('/api/learning/module',{intent:'CAC'})).body.data;
  const q=(await f.request('/api/learning/quiz',{module_id:m.module_id,version:1})).body.data;
  const a=(await f.request('/api/attempts',{quiz_id:q.quiz_id,answers:q.questions.map(q=>q.correct_option)})).body.data;
  assert.equal(a.score,100);
  const feedback=await f.request('/api/learning/feedback',{attempt_id:a.attempt_id,score:0});assert.equal(feedback.status,200);
  const input=JSON.parse(f.db.prepare("SELECT input_json FROM agent_runs WHERE operation='feedback'").get().input_json);
  assert.equal(input.request.attempt.score,100);
  const trace=JSON.parse(f.db.prepare("SELECT tool_calls_json FROM agent_runs WHERE operation='feedback'").get().tool_calls_json);
  assert.equal(trace.find(t=>t.stage==='tool_result').output.history[0].score,100);
  const q2=(await f.request('/api/learning/quiz',{module_id:m.module_id,version:1})).body.data;
  assert.notEqual(q2.quiz_id,q.quiz_id);assert(q2.questions.some(p=>!q.questions.some(q=>q.question===p.question)));
});
test('Fixture-only: structural error retries exactly once and retains bad output',async t=>{
  const client=fixtureClient({invalid:1}),f=await setup(t,{client});
  assert.equal((await f.request('/api/learning/module',{intent:'CAC'})).status,201);
  assert.equal(client.calls.filter(c=>c.config.responseJsonSchema).length,2);
  const run=f.db.prepare('SELECT * FROM agent_runs').get();assert.match(run.tool_calls_json,/not valid JSON/);
});
test('Fixture-only: second invalid structure fails without third retry',async t=>{
  const client=fixtureClient({invalid:20}),f=await setup(t,{client});
  const result=await f.request('/api/learning/module',{intent:'CAC'});
  assert.equal(result.body.status,'invalid_output');assert.equal(client.calls.filter(c=>c.config.responseJsonSchema).length,2);
  assert.equal(f.store.modules(f.user).length,5);
});
for(const [name,options,expected] of [
  ['search failure',{searchFailure:true},'search_failed'],
  ['empty search',{noSources:true},'insufficient_sources'],
  ['fabricated URL',{inventedSource:true},'insufficient_sources'],
  ['tool identity mismatch',{wrongUser:true},'tool_scope_error'],
  ['model refusal',{refusal:true},'model_refusal']
]) test(`Fixture-only: ${name} is explicit, no content published`,async t=>{
  const client=fixtureClient(options),f=await setup(t,{client});
  const result=await f.request('/api/learning/module',{intent:'CAC'});
  assert.equal(result.body.status,expected);assert.equal(f.store.modules(f.user).length,5);
  assert.equal(f.db.prepare('SELECT status FROM agent_runs').get().status,'failed');
});
