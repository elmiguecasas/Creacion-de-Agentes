# Corrida 2 — DSO

Tipo: academic_final_run. Estado: BLOCKED_PEDAGOGICAL_ISSUE. Usuario técnico: 29f4395a-58c3-4be6-a6e1-987c4d7ca2ee.

Input exacto: «Quiero aprender DSO».

Objetivo: demostrar catálogo abierto, dominio financiero, búsqueda real y generación estructurada; la revisión detectó un defecto pedagógico y detuvo la corrida.

## Secuencia ejecutada

1. POST /api/learning/interpret: HTTP 200 / run 2ace6813-1e4b-4f90-9c81-cf220b85d66e.
2. POST /api/learning/module: HTTP 201 / run 8a44686a-e7af-4d4a-b650-e1ad38633ae3.
3. POST /api/learning/quiz: HTTP 201 / run 7c0b940a-4e7e-4b6b-b360-8642856d2f12.

La interpretación, búsqueda Tavily, módulo y quiz se ejecutaron de nuevo con proveedores reales. AJV aceptó sus estructuras. La fórmula no explicita cuentas por cobrar promedio ni ventas netas a crédito como convención principal solicitada. El quiz trata usar saldo final como distractor no erróneo sin condiciones, lo que puede resultar ambiguo bajo la convención promedio. No se afirma que toda variante de saldo final sea inválida. Se preservan las fuentes y artefactos íntegros.

PEDAGOGICAL ISSUE material; no hay respuestas, intento, score, feedback ni decisión humana. No se crearon archivos ficticios para esas etapas. No se cambió código/prompt ni se inició RRHH. Ver pedagogical-review.json.

## Artefactos

input.json y http-*.json conservan entrada y respuestas HTTP. interpret.json, module.json y quiz.json contienen los artefactos realmente obtenidos. 
tool_calls.json conserva todas las llamadas/respuestas; sources.json contiene evidencia recuperada y selección; usage.json mantiene Gemini usageMetadata y Tavily usage separados, sin inventar campos ausentes. metadata.json registra IDs y hashes de prompts. snapshot-final.json y snapshots intermedios son reconstrucciones de SQLite con el catálogo seed contextual; no se editaron outputs.

## Supervisión

L2 — Autonomía supervisada: convención del proyecto, no definición oficial publicada. El tutor consulta/busca/genera/interpreta/recomienda; el humano inicia/responde/acepta/rechaza y decide el siguiente paso. La revisión del operador detuvo el flujo antes de puntuar una evaluación inconsistente; la decisión vuelve a Chat.

## Reconstrucción e integridad

Verificar SHA-256 de los archivos listados en manifest.json (el manifiesto no se incluye a sí mismo). Seguir run_ids de metadata hacia agent_runs y tool_calls del snapshot; las solicitudes guardan prompts/schema y las respuestas conservan el texto original del modelo. El módulo/version y quiz_id vinculan cada artefacto persistido.
No existe score que recalcular: no se ejecutó intento. La validación estructural exitosa no certifica corrección pedagógica.
Replay/reconstrucción significa inspeccionar y verificar lo guardado. Rerun significa una nueva generación y debe tener nuevos IDs; no se promete texto idéntico. Los archivos se escribieron sin sobrescritura y no contienen claves.
