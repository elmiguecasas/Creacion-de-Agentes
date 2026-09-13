# Corridas académicas — índice final de evidencia

**FASE 6 COMPLETE:** tres corridas reales, distintas y reconstruibles: SLA, DSO original y ruta RRHH. Un fallo pedagógico preservado constituye evidencia real del límite del sistema; no se presenta como contenido aprobado. Ver [informe final consolidado](../../Informe-Fase6-Final.txt) y [documentación del sistema](../README.md).

## Estado académico

| Corrida / carpeta | Input exacto | Estado y cierre |
|---|---|---|
| [1 — SLA](corrida-01-sla/README.md) | Quiero aprender SLA | **PASS**. Seed histórico, quiz nuevo, 60/100, feedback real, ACCEPT explícito; sin iniciar repaso. |
| [2 — DSO original](corrida-02-dso/README.md) | Quiero aprender DSO | **REAL RUN — PEDAGOGICAL FAILURE PRESERVED**. Módulo y quiz reales; detención humana antes de respuestas/attempt/score/feedback. |
| [Iteración DSO](corrida-02-dso-reanudacion/README.md) | Quiero aprender DSO | Evidencia de proceso tras una corrección general autorizada del prompt; mantiene fallo. No reemplaza la original ni cuenta como cuarta corrida académica. |
| [3 — RRHH](corrida-03-ruta-rrhh/README.md) | Quiero aprender métricas de Recursos Humanos | **PASS**. Ruta real con Tavily, AJV y persistencia; ACCEPT; sin generar módulos, quizzes o attempts. |

Los README y metadata sellados de DSO pueden conservar BLOCKED/PEDAGOGICAL ISSUE: describen el estado observado al ejecutarse. La clasificación académica consolidada de este índice acepta esa evidencia sin cambiar el diagnóstico, los outputs ni los manifiestos. No se regeneró repetidamente hasta obtener un resultado favorable: se conserva la original y una reanudación autorizada, ambas con sus fallos.

SLA conserva continuidad con Entrega 1: interpretación y feedback Gemini con progreso real, quiz congelado nuevo sobre seed; no hubo Tavily para ese seed. Sus respuestas se seleccionaron para ejercitar feedback adaptativo, no como evaluación académica del autor.

DSO demuestra inconsistencia entre convenciones de fórmula y preguntas que aceptaban/penalizaban criterios incompatibles. La revisión L2 detuvo el flujo antes de producir score. **JSON/AJV válido no garantiza exactitud pedagógica.** La aceptación académica de la corrida no equivale a ACCEPT de su contenido ni agrega una decisión de endpoint inexistente.

RRHH propone rotación → costo por contratación → absentismo → ingresos por empleado. La búsqueda recuperó cinco resultados y se conservaron fuentes de Sage, BambooHR, Dayforce, ExtensisHR y Predictive Index. Un snippet de Sage tenía una fórmula de rotación aparentemente problemática; la ruta no la reprodujo. Se aceptó la ruta razonable sin generaciones adicionales ni módulos ficticios.

## IDs para seguir las trazas

| Carpeta | Operación → run_id |
|---|---|
| SLA | interpret → `b5f9cfc0-293b-4aa1-acdc-f9706ee30e1f`; feedback → `12c0b6ec-5c35-4001-bbfc-2697013e40fb` |
| DSO original | interpret → `174e8ae2-dad9-4196-9ed2-40b46a00bb96`; module → `532bd536-dbbc-432a-b7d3-07e3a8b00485`; quiz → `554b5e17-1185-4cc6-9949-782ee07c5840` |
| DSO iteración | interpret → `2ace6813-1e4b-4f90-9c81-cf220b85d66e`; module → `8a44686a-e7af-4d4a-b650-e1ad38633ae3`; quiz → `7c0b940a-4e7e-4b6b-b360-8642856d2f12` |
| RRHH | interpret → `4eb14963-eac0-48b2-ab59-b0a2e19c317f`; route → `105ad5af-188e-485a-959a-13dce7b4e4ce` |

`metadata.json` y los snapshots vinculan estos runs con usuario técnico, artefactos, versiones y timestamps. El catálogo seed incluido en snapshots es contexto persistido: no significa que se hayan generado o completado esos módulos durante la corrida.

## Localizar y reconstruir

Cada ruta de esta tabla es relativa a la carpeta individual de la corrida:

| Evidencia | Archivo / ubicación |
|---|---|
| Input y contexto | `input.json`, `metadata.json`, solicitudes en `http-*.json` |
| Interpretación | `interpret.json` |
| Módulo y quiz | `module.json`, `quiz.json` en SLA/DSO; RRHH usa `route.json` |
| Respuestas, score, feedback | `answers.json`, `attempt.json`, `feedback.json` sólo en SLA |
| Tool calls, query Tavily, respuestas | `tool_calls.json`, `agent_runs` del snapshot |
| Fuentes recuperadas/seleccionadas | `sources.json`, trazas de herramientas y artefactos |
| Uso real | `usage.json`; en DSO original usar además `usage-by-provider.json` y `evidence-note.md` |
| Revisión y decisión | `pedagogical-review.json`; `human_decision.json` donde existe aceptación registrada |
| Estado completo | `snapshot-final.json` y snapshots intermedios |
| Integridad y comprobaciones previas | `manifest.json`, `verification.json`; suplemento en DSO original |

En DSO original el extractor inicial incluyó una fila Tavily con usageMetadata nulo dentro del agrupado Gemini. Se preservó ese archivo; `usage-by-provider.json` corrige la clasificación por proveedor y `evidence-note.md` explica el problema. `manifest-supplement.json` cubre el suplemento y el manifiesto original. No se alteraron respuestas externas.

### Reconstrucción offline

1. Verificar cada entrada `file`/`sha256` del manifiesto contra el archivo exacto. En PowerShell, por ejemplo desde la raíz del proyecto: `Get-FileHash -Algorithm SHA256 -LiteralPath corridas/corrida-01-sla/input.json`. Comparar sin distinguir mayúsculas del hash. Verificar también el suplemento DSO.
2. Seguir el input y los run_ids de metadata hasta `agent_runs` y `tool_calls` del snapshot. Examinar las solicitudes/respuestas conservadas, no una nueva consulta web.
3. Relacionar módulo/version, quiz_id, intento y decisión. Leer la revisión humana y los estados fallidos sin reinterpretarlos como éxito.
4. En SLA, aplicar `scoreQuiz` de [shared/scoring.js](../shared/scoring.js) al `quiz_json` congelado y `answers_json` del intento (parsearlos si son cadenas). Comparar score, correct_count y results con lo persistido: 60 y tres aciertos. DSO/RRHH no tienen score reconstruible porque no hubo intento.
5. Usar los prompts y schemas efectivos guardados en cada run. Los actuales no sustituyen versiones anteriores.

El manifiesto inicial no se incluye a sí mismo. Verificar hashes prueba integridad respecto del manifiesto disponible, no autentica por sí solo al proveedor. No hay importador que reconstruya automáticamente una base SQLite a partir del snapshot.

**Replay / reconstrucción** significa recuperar exactamente lo ocurrido desde artefactos. **Rerun** invoca de nuevo proveedores externos, consume recursos, exige IDs nuevos y puede producir resultados distintos. Ni Gemini ni Tavily se afirman determinísticos. Un run `running` es una ejecución interrumpida, no éxito.

## Contrato y versiones preservadas

| Artefacto | SHA-256 |
|---|---|
| System prompt de SLA y DSO original | `35b8bf813106a2f44823f11caf7f526152617d043d8f87ec995ebd947bcf5d15` |
| System prompt ejecutado en iteración DSO y RRHH (vigente en Fase 7) | `193203d4dc0f8f7c8aaeb9e1908e2c26985e08936ca2137b87d1fafb66a1b860` |
| User prompt común | `179cfda9ca16b01832e80ebec7e1c04c6e9d36343eee3bd2445a8ff5d1f4852a` |

La versión combinada incorpora también schemas; los hashes individuales no son intercambiables con `prompt_version`. Las seis piezas del contrato siguen en ambos prompts. Después de estas corridas, Fase 8 armonizó únicamente la instrucción L2: el SHA-256 actual del system prompt es `2c84b8a045dd8951ba62faec0eb31f5e22718d345d8c2cb5badd76891b265a35`. Esa versión posterior no se reejecutó. Los snapshots, metadata y hashes históricos anteriores permanecen intactos; ver [DECISIONES D25](../DECISIONES.md#d25--armonizar-l2-después-de-las-corridas).

## Uso real preservado

Resumen de los valores ya conservados en el informe final; no se generó consumo nuevo para este índice:

| Ejecución | Gemini promptTokenCount | candidatesTokenCount | totalTokenCount | Tavily créditos reportados |
|---|---:|---:|---:|---|
| SLA | 9425 | 473 | 9898 | Sin búsqueda |
| DSO original | 14496 | 2166 | 16662 | 1 |
| DSO iteración | 15468 | 1945 | 17413 | 1 |
| RRHH | 10519 | 889 | 11408 | 1 |

Consultar la metadata cruda para otros campos presentes. Campos ausentes no se convierten en cero. La iteración está separada del conjunto académico; créditos/tokens no certifican un plan gratuito ni constituyen un análisis monetario final.

## Supervisión y preservación

**L2 — Autonomía supervisada**, convención operativa del proyecto ante ausencia de definiciones oficiales publicadas L0–L4. El agente interpreta/consulta/busca/genera/analiza/recomienda; el humano inicia/responde/revisa/acepta o rechaza/decide el siguiente paso. SLA aporta ACCEPT sin repaso, DSO detección y detención, RRHH ACCEPT sin inicio de módulos. En estas corridas la aceptación se registró por endpoint; no se activaron los botones del frontend que combinan aceptar e iniciar una actividad elegida.

Las carpetas selladas, outputs, manifiestos y prompts ejecutados permanecen intactos. Las pruebas técnicas de Fase 5 no se cuentan como corridas académicas. La evidencia de la iteración se conserva, pero no aumenta artificialmente el número de corridas finales.

Para exportar evidencia existente de otro usuario: `npm run export:run -- <user-id>` desde la raíz, con la base correcta en DATABASE_PATH. El comando genera un snapshot nuevo sin sobrescritura y muestra SHA-256; no llama a proveedores y puede incluir múltiples runs. No usarlo para reemplazar estos archivos sellados.

Las evidencias revisadas no contienen claves. `.env` es local, ignorado y no entregable. Los JSON directamente bajo `corridas/` están ignorados por Git; las subcarpetas académicas no se excluyen automáticamente. Revisar privacidad e integridad antes de versionar o compartir, sin editar outputs reales para hacerlos parecer correctos.
