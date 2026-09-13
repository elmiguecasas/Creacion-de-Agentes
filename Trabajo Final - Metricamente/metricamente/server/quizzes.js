import { randomInt, randomUUID } from 'node:crypto';
import { AppError } from './errors.js';

export function shuffle(items, pick=randomInt) {
  const a=[...items];
  for(let i=a.length-1;i>0;i--) { const j=pick(i+1); [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
export function selectSeed(bank,previous) {
  const used=new Set(previous?.questions.map(q=>q.question_id)||[]);
  return [...shuffle(bank.filter(q=>!used.has(q.question_id))),...shuffle(bank.filter(q=>used.has(q.question_id)))].slice(0,5);
}
export function freezeQuiz(moduleId,questions) {
  return {quiz_id:randomUUID(),version:1,module_id:moduleId,questions:shuffle(questions).map(q=>{
    const options=shuffle(q.options.map((text,i)=>({text,correct:i===q.correct_option})));
    return {...q,options:options.map(o=>o.text),correct_option:options.findIndex(o=>o.correct)};
  })};
}
export function ensureAlternative(quiz,previous) {
  if(!previous) return;
  const normalize=s=>s.normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
  const old=new Set(previous.questions.map(q=>normalize(q.question)));
  if(quiz.questions.every(q=>old.has(normalize(q.question)))) throw new AppError('no_alternative_quiz','No se obtuvo un quiz alternativo. El anterior se conserva.',422);
}
