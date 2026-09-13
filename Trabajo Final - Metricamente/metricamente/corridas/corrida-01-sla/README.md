# Corrida 1 — SLA

Tipo: academic_final_run. Estado: PASS. Usuario técnico: 8a5a00a5-032c-4e2e-aecc-a15957773167.

Input exacto: «Quiero aprender SLA».

Objetivo: demostrar continuidad con Entrega 1 y flujo completo con score y feedback reales.

## Secuencia ejecutada

1. POST /api/learning/interpret: HTTP 200 / run b5f9cfc0-293b-4aa1-acdc-f9706ee30e1f.
2. GET /api/modules: HTTP 200.
3. POST /api/learning/quiz: HTTP 201.
4. POST /api/attempts: HTTP 200.
5. POST /api/learning/feedback: HTTP 200 / run 12c0b6ec-5c35-4001-bbfc-2697013e40fb.
6. POST /api/decisions: HTTP 200.

La interpretación y el feedback usan Gemini real y get_learning_progress. El módulo SLA y su banco son seed históricos, seleccionados expresamente para continuidad; el quiz fue congelado y mezclado de nuevo para esta corrida. No son fixtures de Fase 5. No hubo búsqueda Tavily ni se inventaron fuentes para el seed.

Las respuestas fueron seleccionadas para ejercitar el mecanismo de feedback adaptativo; no constituyen una evaluación académica del autor.

Score oficial: 60/100, tres aciertos. El feedback recomendó review sobre fórmula y componentes de reporte. El usuario respondió ACCEPT explícitamente en la conversación. El operador registró esa decisión por endpoint; no inició repaso ni otro intento.

## Artefactos

input.json y http-*.json conservan entrada y respuestas HTTP. interpret.json, module.json y quiz.json contienen los artefactos realmente obtenidos. answers.json, attempt.json, feedback.json y human_decision.json conservan el cierre del flujo.
tool_calls.json conserva todas las llamadas/respuestas; sources.json contiene evidencia recuperada y selección; usage.json mantiene Gemini usageMetadata y Tavily usage separados, sin inventar campos ausentes. metadata.json registra IDs y hashes de prompts. snapshot-final.json y snapshots intermedios son reconstrucciones de SQLite con el catálogo seed contextual; no se editaron outputs.

## Supervisión

L2 — Autonomía supervisada: convención del proyecto, no definición oficial publicada. El tutor consulta/busca/genera/interpreta/recomienda; el humano inicia/responde/acepta/rechaza y decide el siguiente paso. La aceptación humana está registrada y no provocó avance automático.

## Reconstrucción e integridad

Verificar SHA-256 de los archivos listados en manifest.json (el manifiesto no se incluye a sí mismo). Seguir run_ids de metadata hacia agent_runs y tool_calls del snapshot; las solicitudes guardan prompts/schema y las respuestas conservan el texto original del modelo. El módulo/version y quiz_id vinculan cada artefacto persistido.
Para recalcular: usar shared/scoring.js del proyecto con quizzes[].quiz_json y attempts[].answers_json; comparar score y results con el intento. verification.json registra la comprobación realizada.
Replay/reconstrucción significa inspeccionar y verificar lo guardado. Rerun significa una nueva generación y debe tener nuevos IDs; no se promete texto idéntico. Los archivos se escribieron sin sobrescritura y no contienen claves.
