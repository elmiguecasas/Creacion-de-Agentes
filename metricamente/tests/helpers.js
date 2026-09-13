import { randomUUID } from 'node:crypto';
import { createApp } from '../server/app.js';
export async function setup(t,agentOptions={apiKey:''},databasePath=':memory:') {
  const instance=createApp({databasePath,agentOptions});
  const server=instance.app.listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  t.after(async()=>{await new Promise(resolve=>server.close(resolve));instance.db.close();});
  const base=`http://127.0.0.1:${server.address().port}`,user=randomUUID();
  const request=async(path,body,identity=user)=>{
    const res=await fetch(base+path,{method:body?'POST':'GET',headers:{'X-User-Id':identity,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
    return {status:res.status,body:await res.json()};
  };
  return {...instance,server,base,user,request};
}
export const source={source_id:'s1',url:'https://example.org/official-metric',title:'Fixture: organismo de prueba',tier:1,authority_reason:'Fixture explícita; no evidencia web real.'};
export function fixtureClient({invalid=0,searchFailure=false,noSources=false,inventedSource=false,wrongUser=false,refusal=false}={}) {
  const calls=[];let structuredCount=0;
  const response=(parts,extra={})=>({candidates:[{content:{role:'model',parts},finishReason:'STOP',...extra}],modelVersion:'fixture-not-real-gemini',usageMetadata:{promptTokenCount:1,candidatesTokenCount:1,thoughtsTokenCount:0,toolUsePromptTokenCount:0,totalTokenCount:2}});
  return {calls,async searchMetricSources(request){
    if(searchFailure) throw new Error('Simulated search transport failure');
    return {query:request.query,results:noSources?[]:[{url:source.url,title:source.title,content:'Fixture evidence; not a real web search.',score:0.9}],usage:{credits:1},response_time:0.1};
  },models:{async generateContent(request){
    calls.push(structuredClone(request));
    const first=request.contents.find(i=>i.role==='user').parts[0].text;
    const data=JSON.parse(first.split('## Datos de esta solicitud\n')[1]);
    if(request.config.tools?.[0]?.functionDeclarations?.[0]?.name==='search_metric_sources') return response([{functionCall:{name:'search_metric_sources',id:'search-call',args:{query:'fixture query'}}}]);
    if(request.config.tools?.[0]?.functionDeclarations) return response([{functionCall:{name:'get_learning_progress',id:'test-call',args:{user_id:wrongUser?randomUUID():data.user_id,area:null,metric:null}}}]);
    structuredCount++;
    if(refusal) return response([],{finishReason:'SAFETY'});
    if(structuredCount<=invalid) return response([{text:'not valid JSON'}]);
    let out;
    if(data.operation==='module') out={module_id:data.module_id,version:1,area:'Marketing',metric:'CAC',title:'Costo de adquisición',definition:'Fixture definition',business_value:'Fixture value',formula:'cost / clients',interpretation:'Fixture interpretation',example:'Fixture example',common_mistake:'Fixture mistake',sources:[inventedSource?{...source,url:'https://unretrieved.example/'}:source]};
    if(data.operation==='route') out={route_id:data.route_id,area:'RRHH',title:'Ruta fixture',rationale:'Fixture rationale',modules:[{position:1,metric:'Rotación',reason:'Fixture reason'}],sources:[source]};
    if(data.operation==='quiz') out={quiz_id:data.quiz_id,version:1,module_id:data.module.module_id,questions:Array.from({length:5},(_,i)=>({question_id:`q-${i}`,question:`Pregunta fixture ${i} ${data.previous_quiz?'alternativa':''}`,options:['A','B','C','D'],correct_option:i%4,explanation:'Explicación fixture',source_refs:data.module.sources.map(s=>s.source_id)}))};
    if(data.operation==='feedback') out={diagnosis:'Fixture: desempeño observado',strengths:[],weaknesses:['Fixture weakness'],recommended_action:'review',recommended_focus:'Fixture focus',next_metric:null,reason:'Fixture reason'};
    if(data.operation==='interpret') out={mode:data.preferred_mode||'metric',area:'Marketing',metric:'CAC',intent:data.intent,clarification:null};
    return response([{text:JSON.stringify({status:'ok',data:out,reason:null})}]);}}};
}
