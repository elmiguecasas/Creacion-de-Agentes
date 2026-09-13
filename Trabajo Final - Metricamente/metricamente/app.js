import { scoreQuiz, level } from './shared/scoring.js';

const $=selector=>document.querySelector(selector);
const el=(tag,text,className)=>{
  const node=document.createElement(tag);
  if(text!==undefined) node.textContent=text;
  if(className) node.className=className;
  return node;
};
let userId,modules=[],summary=[],activeTopic,cardIndex=0,quiz,questionIndex=0,answers=[],busy=false;
const status=(message,error=false)=>{ $('#app-status').textContent=message;$('#app-status').classList.toggle('error',error); };
function show(name) {
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  $(`#view-${name}`).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}
async function api(path,body) {
  const response=await fetch(path,{method:body?'POST':'GET',headers:{'X-User-Id':userId,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const result=await response.json();
  if(!response.ok) throw new Error(result.message||'No se pudo completar la operación.');
  return result;
}
async function act(fn) {
  if(busy) return;
  busy=true;document.body.classList.add('busy');$('main').setAttribute('aria-busy','true');
  try { await fn(); } catch(e) { status(e.message||'No se pudo conectar con el servidor.',true); }
  finally { busy=false;document.body.classList.remove('busy');$('main').removeAttribute('aria-busy'); }
}
function button(text,fn,className='button secondary') {
  const b=el('button',text,className);b.type='button';b.addEventListener('click',()=>act(fn));return b;
}
function sources(target,list) {
  target.replaceChildren();
  if(!list.length) { target.append(el('p','Contenido inicial de Entrega 1: sin fuentes externas registradas.','source-note'));return; }
  target.append(el('h3','Fuentes'));
  const ul=el('ul');
  for(const s of list) {
    let url;try{url=new URL(s.url);}catch{continue;}
    if(!['http:','https:'].includes(url.protocol)) continue;
    const li=el('li'),link=el('a',s.title);link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
    li.append(link,el('span',` · ${s.authority_reason}`));ul.append(li);
  }
  target.append(ul);
}
async function renderHome() {
  const [catalog,progress]=await Promise.all([api('/api/modules'),api(`/api/progress/${userId}`)]);
  modules=catalog.modules;summary=progress.summary;
  $('#route-progress').textContent=summary.length===1?'1 concepto evaluado':`${summary.length} conceptos evaluados`;
  const evaluated=modules.filter(m=>summary.some(p=>p.area===m.area&&p.metric===m.metric)).length;
  $('#route-progress-bar').style.width=`${modules.length?evaluated/modules.length*100:0}%`;
  $('#topic-count').textContent=`${modules.length} módulos disponibles · podés pedir otros`;
  const grid=$('#topic-grid');grid.replaceChildren();
  for(const m of modules) {
    const p=summary.find(s=>s.area===m.area&&s.metric===m.metric);
    const b=button('',()=>openStudy(m),'topic-card');
    b.append(el('span',m.metric.slice(0,2).toUpperCase(),'topic-icon'),el('h3',m.title),el('p',m.area),
      el('span',p?`${level(p.last_score)} · último ${p.last_score}% · mejor ${p.best}%`:'Aún no evaluado','topic-status'));
    grid.append(b);
  }
  const rows=$('#progress-rows');rows.replaceChildren();
  for(const p of summary) {
    const row=el('tr');for(const value of [p.area,p.metric,p.attempts,`${p.last_score}%`,`${p.best}%`]) row.append(el('td',String(value)));rows.append(row);
  }
  if(!summary.length) {const tr=el('tr'),td=el('td','Todavía no hay evaluaciones guardadas.');td.colSpan=5;tr.append(td);rows.append(tr);}
}
function cards() {
  return [
    {tag:'Definición',title:activeTopic.title,text:activeTopic.definition,formula:activeTopic.formula},
    {tag:'Interpretación',title:'¿Para qué sirve?',text:`${activeTopic.business_value}\n\n${activeTopic.interpretation}`},
    {tag:'Ejemplo',title:'Llevalo a la práctica',text:activeTopic.example},
    {tag:'Error frecuente',title:'Una distinción importante',text:activeTopic.common_mistake}
  ];
}
function openStudy(module) {
  activeTopic=module;cardIndex=0;
  $('#study-title').textContent=module.title;$('#study-intro').textContent=module.business_value;$('#study-category').textContent=module.area;
  sources($('#study-sources'),module.sources);renderCard();show('study');status('');
}
function renderCard() {
  const all=cards(),card=all[cardIndex];
  $('#card-progress').replaceChildren(...all.map((_,i)=>el('span',undefined,`step ${i<cardIndex?'passed':''} ${i===cardIndex?'current':''}`)));
  const article=$('#study-card');article.replaceChildren(el('span',`Ficha ${cardIndex+1} de ${all.length} · ${card.tag}`,'card-tag'),el('h2',card.title),el('p',card.text));
  if(card.formula) article.append(el('div',card.formula,'formula'));
  $('#previous-card').disabled=cardIndex===0;
  $('#next-card').textContent=cardIndex===all.length-1?'Comenzar quiz →':'Siguiente';
}
async function startQuiz() {
  status('Preparando las preguntas…');
  const response=await api('/api/learning/quiz',{module_id:activeTopic.module_id,version:activeTopic.version});
  quiz=response.data;questionIndex=0;answers=[];
  $('#quiz-title').textContent=activeTopic.title;renderQuestion();show('quiz');status('');
}
function renderQuestion() {
  const q=quiz.questions[questionIndex];
  $('#question-counter').textContent=`Pregunta ${questionIndex+1} de ${quiz.questions.length}`;
  $('#quiz-progress').style.width=`${questionIndex/quiz.questions.length*100}%`;
  const form=$('#quiz-form'),fieldset=el('fieldset');fieldset.append(el('legend',q.question));
  for(const [i,option] of q.options.entries()) {
    const label=el('label',undefined,'option'),input=el('input');input.type='radio';input.name='answer';input.value=String(i);input.required=true;
    label.append(input,el('span',option));fieldset.append(label);
  }
  const actions=el('div',undefined,'question-actions'),submit=el('button',questionIndex===4?'Ver resultado':'Siguiente pregunta','button primary');submit.type='submit';actions.append(submit);
  form.replaceChildren(el('span',`${activeTopic.metric} · Opción múltiple`,'question-kind'),fieldset,actions);
}
async function saveResult() {
  const local=scoreQuiz(quiz,answers);
  status('Guardando tu resultado…');
  let attempt;
  try { attempt=(await api('/api/attempts',{quiz_id:quiz.quiz_id,answers})).data; }
  catch(e) {status(`No se confirmó el guardado. Conservamos tus respuestas en esta pantalla. Pulsá Ver resultado para reintentar. ${e.message}`,true);return;}
  $('#score-value').textContent=`${attempt.score}%`;
  $('#score-ring').style.background=`conic-gradient(var(--lime-dark) ${attempt.score*3.6}deg, #dce2da 0deg)`;
  $('#result-summary').textContent=`${attempt.correct_count} de 5 respuestas correctas. Resultado guardado.`;
  $('#level-badge').textContent=level(attempt.score);
  $('#answer-review').replaceChildren(...quiz.questions.map((q,i)=>{
    const ok=answers[i]===q.correct_option,article=el('article',undefined,`review-item ${ok?'correct':'incorrect'}`);
    article.append(el('span',ok?'Correcta':'Para repasar','review-status'),el('div',q.question,'review-question'),el('p',`Tu respuesta: ${q.options[answers[i]]}`));
    if(!ok) article.append(el('p',`Respuesta correcta: ${q.options[q.correct_option]}`));
    article.append(el('p',q.explanation));return article;
  }));
  $('#recommendation-actions').replaceChildren();$('#feedback-content').textContent='Preparando feedback sobre tu resultado…';
  show('result');status(local.score===attempt.score?'':'El servidor verificó un resultado distinto del cálculo local.',local.score!==attempt.score);
  try {
    const response=await api('/api/learning/feedback',{attempt_id:attempt.attempt_id});renderFeedback(response);
  } catch(e) {$('#feedback-content').textContent=`Tu resultado fue registrado, pero el feedback no pudo generarse. ${e.message}`;}
}
function renderFeedback(response) {
  const f=response.data,target=$('#feedback-content');target.replaceChildren(el('p',f.diagnosis));
  for(const [label,items] of [['Fortalezas',f.strengths],['Para reforzar',f.weaknesses]]) {
    if(items.length) {target.append(el('h3',label));const ul=el('ul');items.forEach(s=>ul.append(el('li',s)));target.append(ul);}
  }
  target.append(el('p',`Foco sugerido: ${f.recommended_focus}`),el('p',f.reason));
  const names={review:'Repasar fichas',retry:'Intentar otro quiz',continue:f.next_metric?`Aprender ${f.next_metric}`:'Ver conceptos'};
  $('#recommendation-actions').replaceChildren(button(names[f.recommended_action],async()=>{
    await api('/api/decisions',{run_id:response.run_id,decision:'accept'});
    if(f.recommended_action==='review') openStudy(activeTopic);
    else if(f.recommended_action==='retry') await startQuiz();
    else if(f.next_metric) await newModule(`Quiero aprender ${f.next_metric}`,activeTopic.area);
    else {await renderHome();show('home');}
  },'button primary'),button('Elegir otro paso',async()=>{await api('/api/decisions',{run_id:response.run_id,decision:'reject'});await renderHome();show('home');}));
}
async function newModule(intent,area=null) {
  status('Buscando fuentes y preparando el módulo…');
  const response=await api('/api/learning/module',{intent,area});openStudy(response.data);
}
function renderRoute(response) {
  const route=response.data;$('#route-title').textContent=route.title;$('#route-rationale').textContent=route.rationale;
  $('#route-modules').replaceChildren(...route.modules.map(m=>{
    const article=el('article',undefined,'review-item');
    article.append(el('h2',`${m.position}. ${m.metric}`),el('p',m.reason),button('Estudiar este concepto',async()=>{
      await api('/api/decisions',{run_id:response.run_id,decision:'accept'});
      await newModule(`Quiero aprender ${m.metric}`,route.area);
    },'button primary'));return article;
  }));
  sources($('#route-sources'),route.sources);
  $('#reject-route').onclick=()=>act(async()=>{await api('/api/decisions',{run_id:response.run_id,decision:'reject'});show('home');});
  show('route');status('Esta ruta es una propuesta. Ningún módulo está marcado como completado.');
}
$('#intent-form').addEventListener('submit',event=>{event.preventDefault();act(async()=>{
  const intent=$('#learning-intent').value.trim();status('Interpretando tu objetivo…');
  const parsed=(await api('/api/learning/interpret',{intent,mode:$('#learning-mode').value})).data;
  if(parsed.mode==='clarify') {status(parsed.clarification||'Agregá contexto a tu solicitud.');return;}
  if(parsed.mode==='area') {status('Buscando fuentes para proponer una ruta…');renderRoute(await api('/api/learning/route',{intent:parsed.intent}));}
  else await newModule(parsed.intent,parsed.area);
});});
$('#quiz-form').addEventListener('submit',event=>{event.preventDefault();act(async()=>{
  if(answers.length===5) {await saveResult();return;}
  const selected=$('#quiz-form input:checked');if(!selected)return;
  answers.push(Number(selected.value));
  if(answers.length<5) {questionIndex++;renderQuestion();}else await saveResult();
});});
$('#previous-card').addEventListener('click',()=>act(()=>{if(cardIndex){cardIndex--;renderCard();}}));
$('#next-card').addEventListener('click',()=>act(async()=>{if(cardIndex===cards().length-1)await startQuiz();else{cardIndex++;renderCard();}}));
$('#back-to-study').addEventListener('click',()=>act(()=>{show('study');status('Volver a comenzar el quiz preparará una nueva evaluación.');}));
$('#retry-quiz').addEventListener('click',()=>act(startQuiz));
for(const b of [$('#home-button'),$('#continue-route'),...document.querySelectorAll('[data-go-home]')]) b.addEventListener('click',()=>act(async()=>{await renderHome();show('home');status('');}));

act(async()=>{
  try {
    userId=localStorage.getItem('metricamente-user-id');
    if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId||'')) {
      userId=crypto.randomUUID();localStorage.setItem('metricamente-user-id',userId);
    }
    if(localStorage.getItem('metricamente-operaciones-v1')) $('#legacy-notice').textContent='Conservamos tu resumen anterior en este navegador, separado de los nuevos intentos. No contiene respuestas históricas recuperables.';
  } catch {throw new Error('No se pudo conservar tu identidad local. Habilitá el almacenamiento del navegador para registrar tu progreso.');}
  await renderHome();
});
