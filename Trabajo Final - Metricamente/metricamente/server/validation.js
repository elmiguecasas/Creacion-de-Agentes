import Ajv from 'ajv';
import fs from 'node:fs';
import { AppError } from './errors.js';

const ajv = new Ajv({ allErrors: true, strict: true });
export const schemas = Object.fromEntries(['module','quiz','route','feedback','interpret'].map(name =>
  [name, JSON.parse(fs.readFileSync(new URL(`../schemas/${name}.schema.json`, import.meta.url), 'utf8'))]));
const validators = Object.fromEntries(Object.entries(schemas).map(([name,schema]) => [name,ajv.compile(schema)]));
export function validate(name, data) {
  if (!validators[name](data)) throw new AppError('invalid_output', `Estructura ${name} inválida: ${ajv.errorsText(validators[name].errors)}`, 422);
  if (name === 'quiz') {
    if (new Set(data.questions.map(q=>q.question_id)).size !== 5 || new Set(data.questions.map(q=>q.question.trim().toLowerCase())).size !== 5 ||
        data.questions.some(q=>new Set(q.options.map(o=>o.trim().toLowerCase())).size !== 4)) {
      throw new AppError('invalid_output','El quiz contiene preguntas u opciones duplicadas.',422);
    }
  }
  if (name === 'route' && data.modules.some((m,i)=>m.position !== i+1)) throw new AppError('invalid_output','Posiciones de ruta no consecutivas.',422);
  return data;
}
export function envelope(name) {
  return {type:'object',additionalProperties:false,required:['status','data','reason'],properties:{
    status:{type:'string',enum:['ok','insufficient_sources']},
    data:{anyOf:[schemas[name],{type:'null'}]},reason:{type:['string','null']}
  }};
}
export function parseEnvelope(name, text) {
  let v;
  try { v=JSON.parse(text); } catch { throw new AppError('invalid_output','El modelo no devolvió JSON válido.',422); }
  if (!ajv.validate(envelope(name),v)) throw new AppError('invalid_output','La respuesta no cumple el contrato estructurado.',422);
  if (v.status === 'insufficient_sources') {
    if (v.data !== null || !v.reason) throw new AppError('invalid_output','Estado de fuentes insuficientes inconsistente.',422);
    throw new AppError('insufficient_sources',v.reason,422);
  }
  return validate(name,v.data);
}
export function safeUrl(value) {
  try { const u=new URL(value); return ['http:','https:'].includes(u.protocol) && !u.username && !u.password; } catch { return false; }
}
export function validateSources(data, retrieved) {
  const urls = new Set(retrieved.map(s=>s.url));
  const ids = data.sources.map(s=>s.source_id);
  if (!data.sources.length || new Set(ids).size !== ids.length || !data.sources.some(s=>s.tier<=2) ||
      data.sources.some(s=>!safeUrl(s.url) || !urls.has(s.url))) {
    throw new AppError('insufficient_sources','Faltan fuentes trazables de nivel 1 o 2. No se publicó contenido.',422);
  }
}
export function validateQuizSources(quiz,module) {
  const ids = new Set(module.sources.map(s=>s.source_id));
  if (quiz.module_id !== module.module_id || quiz.questions.some(q=>
    (ids.size>0 && q.source_refs.length===0) || q.source_refs.some(id=>!ids.has(id)))) {
    throw new AppError('invalid_output','Referencias del quiz no corresponden al módulo.',422);
  }
}
