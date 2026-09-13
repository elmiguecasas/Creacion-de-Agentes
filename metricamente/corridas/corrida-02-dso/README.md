# Corrida 2 — DSO

Tipo: academic_final_run. Estado: BLOCKED_PEDAGOGICAL_ISSUE. Usuario técnico: 9076827e-eaba-4785-a5bd-9f472c3264b1.

Input exacto: «Quiero aprender DSO».

Objetivo: demostrar catálogo abierto, dominio financiero, búsqueda real y generación estructurada; la revisión detectó un defecto pedagógico y detuvo la corrida.

## Secuencia ejecutada

1. POST /api/learning/interpret: HTTP 200 / run 174e8ae2-dad9-4196-9ed2-40b46a00bb96.
2. POST /api/learning/module: HTTP 201 / run 532bd536-dbbc-432a-b7d3-07e3a8b00485.
3. POST /api/learning/quiz: HTTP 201 / run 554b5e17-1185-4cc6-9949-782ee07c5840.

La interpretación, búsqueda Tavily, módulo y quiz se ejecutaron de nuevo con proveedores reales. AJV aceptó sus estructuras. El módulo mezcla net credit sales con net revenue sin condiciones y el quiz los trata simultáneamente como alternativa válida y como error. Se preservan las fuentes y artefactos íntegros.

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
