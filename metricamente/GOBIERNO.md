# Gobierno y riesgo — Metricamente

## A. Estado y alcance

**PASS — FASE 10 COMPLETE.** Formalización documental al 13/09/2026, contrastada con código y evidencia preservada. No se ejecutaron proveedores, corridas, tests funcionales ni Fase 11. No se modificaron prompts, arquitectura, schemas, scoring, SQLite o herramientas.

Este documento diferencia **CONTROL IMPLEMENTADO**, **REGLA OPERATIVA HUMANA** y **RIESGO RESIDUAL**. Una prohibición del contrato no garantiza que el modelo nunca produzca texto contrario; los límites de herramientas y las verificaciones del servidor restringen las acciones que ese texto puede provocar. No se atribuyen funciones al software por declararlas aquí.

## B. Perímetro y permisos reales

| Sistema | Función y permiso efectivo | Límite / evidencia de implementación |
|---|---|---|
| Gemini 3.5 Flash-Lite | Interpretar, generar, analizar y emitir function calls dentro de operaciones acotadas | Sólo se declaran progreso y búsqueda, por etapas. No recibe API keys en el contexto, SQL arbitrario ni herramientas de escritura. [agent.js](server/agent.js) |
| Tavily / search_metric_sources | Recibir una query y devolver resultados web | Backend realiza POST a `/search`, basic, máximo cinco resultados; no se implementan escrituras externas, gestión de cuentas ni billing. La llamada consume créditos. [agent.js](server/agent.js) |
| get_learning_progress | **READ ONLY**: consultar historial/summary del UUID vinculado y filtros area/metric | Valida argumentos e identidad antes de `store.progress`; no acepta SQL del modelo. [store.js](server/store.js) |
| SQLite | Persistir usuarios técnicos, módulos, quizzes, attempts, runs, rutas y decisiones | Acceso por backend y proceso local autorizado; consultas parametrizadas, transacción de intento y triggers. El servidor sí escribe como parte del flujo; el modelo no tiene acceso directo. [database.js](server/database.js) |
| Frontend | Recoger intención/respuestas/decisiones y presentar contenido/progreso | Hace llamadas a la API con UUID local; no decide el score oficial. Botones explícitos pueden aceptar e iniciar el paso elegido. [app.js](app.js) |
| Archivos y evidencia | Exportar snapshots y preservar outputs, manifests y documentación mediante aplicación/proceso local | No hay herramienta de filesystem del agente. El [exportador](scripts/export-run.js) crea un archivo nuevo sin sobrescribir; manifiestos académicos se prepararon mediante proceso local. No son archivos físicamente inviolables para su administrador. |
| Servidor Express | Validar solicitudes, ejecutar operaciones y entregar archivos públicos permitidos | Lista explícita de frontend, CSP, comprobación Origin cuando está presente, UUID y límite JSON 32 KB. Esto no constituye autenticación completa. [app servidor](server/app.js) |
| Google Fonts | Cargar estilos/fuentes del frontend | Dependencia de presentación existente; puede implicar solicitudes del navegador a Google, sin herramienta agéntica ni acceso al score/SQLite. [index.html](index.html) |

Las claves se usan en el servidor para autenticar ante cada proveedor: «el modelo no recibe claves» no significa que el proveedor pueda ser invocado sin credencial. Intención, progreso y artefactos se envían a Gemini según la operación; la query se envía a Tavily. No introducir datos personales sensibles o información empresarial confidencial. La redacción de credenciales protege trazas, no equivale a anonimizar todo contenido del usuario ni sustituye condiciones de tratamiento de datos de proveedores.

## C. Acciones prohibidas y alcance de su prevención

| Acción prohibida al agente | Control o regla vigente | Límite residual |
|---|---|---|
| Alterar score oficial | Score calculado por [código](shared/scoring.js), contra quiz congelado; backend ignora score/clave del cliente | Puede generar una explicación errónea; no cambia el valor persistido |
| Modificar/borrar attempts o cambiar respuestas después de guardar | Triggers y ausencia de endpoints de edición; distinto reenvío devuelve `attempt_locked` 409 | Administrador local podría alterar la base fuera de la aplicación |
| Editar manifests, snapshots o documentos | No dispone de herramientas de archivos | Integridad depende también de custodia humana; SHA-256 permite detectar cambios respecto del manifiesto |
| Inventar fuentes | Prohibición del prompt y validación de URLs recuperadas con contenido; referencias de quiz vinculadas al módulo | No se prueba que cada afirmación/cita sea verdadera ni que la autoridad clasificada sea correcta |
| Fallback silencioso ante búsqueda fallida | `insufficient_sources` / `search_failed`; no reemplazo por conocimiento interno | Nueva solicitud sólo por iniciativa humana; puede fallar otra vez |
| Acceder a API keys | Credenciales fuera del prompt; redacción de valores/campos en trazas y lista pública restringida | No protege frente a compromiso del host o una exposición humana fuera de ese flujo |
| Ejecutar SQL arbitrario | Sólo progreso parametrizado y filtros acotados | UUID vinculado no demuestra identidad auténtica |
| Habilitar billing o modificar proveedor | Sin herramientas administrativas; configuración del servidor fuera de acciones del modelo | El operador puede cambiar configuración fuera de la aplicación bajo autorización; no ocurrió en esta fase |
| Publicar en GitHub | No hay herramienta Git/GitHub del tutor | Publicación/distribución es decisión y acción separada del operador |
| Marcar módulos completados sin evidencia | Progreso derivado de attempts; aceptar ruta no genera completitud | Un score acredita respuestas, no comprensión universal |
| Avanzar autónomamente tras recomendar | El agente devuelve recomendación, no la ejecuta; `/api/decisions` sólo registra | Un clic humano en botones de actividad combina ACCEPT e inicio; no es una ejecución autónoma |
| Aceptar/rechazar rutas en nombre del humano | No hay function call de decisiones; operación de frontend/operador | Endpoint no autentica una firma personal ni verifica revisión pedagógica; requiere disciplina y custodia del UUID |

Estas prohibiciones describen el perímetro de Metricamente, no una garantía contra toda acción de un usuario con acceso administrativo. No se añaden aquí bloqueos funcionales nuevos.

## D. Autonomía L2 y evidencia

**L2 — Autonomía supervisada** es una convención operativa del proyecto ante ausencia de definición oficial publicada L0–L4. **No es un estándar oficial de UCEMA ni una definición normativa de la cátedra.** La frase vigente fue armonizada después de las corridas, en Fase 8; sus versiones históricas permanecen en snapshots. Ver [DECISIONES D25](DECISIONES.md#d25--armonizar-l2-después-de-las-corridas).

El agente interpreta, consulta progreso, busca, genera, analiza y recomienda. El humano inicia, responde, revisa, acepta/rechaza y decide el siguiente paso.

| Evidencia real | Supervisión observada | Lo que no se afirma |
|---|---|---|
| [SLA — decisión](corridas/corrida-01-sla/human_decision.json) y [README](corridas/corrida-01-sla/README.md) | Score 60, feedback, ACCEPT explícito registrado; no se inició repaso | No fue una decisión autónoma del modelo |
| [DSO — revisión](corridas/corrida-02-dso/pedagogical-review.json) | Inconsistencia detectada por supervisión humana; detención antes de respuestas/attempt/score/feedback | No hubo filtro pedagógico automático que rechazara el JSON |
| [DSO iteración — revisión](corridas/corrida-02-dso-reanudacion/pedagogical-review.json) | Segundo fallo tras regla general; nueva detención y posterior decisión de no regenerar | No se aprobó ninguna DSO ni se reemplazó la original |
| [RRHH — decisión](corridas/corrida-03-ruta-rrhh/human_decision.json) y [README](corridas/corrida-03-ruta-rrhh/README.md) | Ruta revisada, ACCEPT autorizado; ningún módulo/quiz/attempt iniciado | Aprobar una ruta no significa completar sus módulos |

DSO original es **REAL RUN — PEDAGOGICAL FAILURE PRESERVED**, válida como evidencia académica fallida. Su reanudación es traza de iteración, no cuarta corrida final. Ninguno de estos registros se modifica con esta formalización.

## E. Responsable y autoridad final

**Responsable/firma final: autor/operador humano de Metricamente.** No se inventa un comité, rol organizacional ni reemplazo automático.

Su autoridad operativa incluye aprobar resultados para uso, rechazar o vetar contenido, detener el flujo, decidir si una salida puede utilizarse, solicitar una nueva corrida con IDs nuevos, impedir que se responda/puntúe material evaluativo inconsistente y decidir publicación/distribución.

La firma final significa responsabilidad humana por esa decisión; la aplicación registra UUID, run, decisión y timestamp, **no una firma digital autenticada**. La revisión académica se conserva además en artefactos del proceso. Para vetar un quiz antes del score, el operador debe no enviar respuestas y registrar el motivo en evidencia separada. No existe un endpoint que marque automáticamente «quiz vetado» o bloquee pedagógicamente el envío.

Si el defecto se descubre después de un intento, preservar score/quiz originales y documentar el diagnóstico, sin retocar la clave o el historial. Una nueva generación requiere decisión expresa y queda como evidencia distinta. El operador puede detener nuevas acciones y el servicio local; no hay mecanismo de cancelación remota que garantice retirar una solicitud externa ya enviada o evitar su consumo.

## F. Ausencia del responsable

**REGLA OPERATIVA HUMANA:** si no está disponible el responsable y una salida requiere revisión, queda **PENDING REVIEW**, no aprobada. Se conserva la evidencia disponible; no se registra ACCEPT/REJECT por sustitución ni se ejecutan decisiones supervisadas automáticamente. El flujo puede reanudarse cuando exista revisión humana. No se designa un agente como suplente.

**Estado real del software:** `PENDING REVIEW` es una clasificación del proceso, no un nuevo estado en SQLite, schema o interfaz. Un run puede estar `completed` técnicamente y seguir pendiente de aprobación humana. La ausencia de decisión no equivale a aceptación; tampoco implementa por sí sola una cola de revisión. El servidor no detecta presencia del responsable ni exige aprobación pedagógica antes de mostrar un módulo o aceptar respuestas.

Por tanto, esta regla se cumple mediante operación supervisada: no enviar respuestas ni iniciar actividades que requieran revisión hasta disponer del humano. Una generación ya iniciada puede finalizar y persistirse mientras se espera; finalizar no significa aprobar. Si se interrumpe el proceso o falla SQLite, la evidencia podría quedar parcial. No se promete recuperación automática ni conservación infalible.

## G. Matriz de riesgos

**14 riesgos.** OBSERVADO significa evidencia real del proyecto; PREVISTO significa riesgo identificado/control implementado sin afirmar validación externa de esa rama. Una misma fila puede tener un fallo observado y riesgos residuales previstos.

| Riesgo | Falla concreta | Consecuencia | Control preventivo | Respuesta | Evidencia |
|---|---|---|---|---|---|
| 1. Quiz ambiguo — OBSERVADO | CAC: pregunta sobre error con varios errores correctos entre distractores | Corrección injustificada del aprendizaje | Regla general de una opción correcta y revisión humana; AJV sólo estructura | Preservar original; no puntuar; nueva generación sólo autorizada | [CAC revisión](../Fase5-evidencia-Tavily/pedagogical-review.json) |
| 2. Fuentes insuficientes — OBSERVADO | Ruta Fase 5 seleccionó sólo fuentes tier 3 | Contenido sin fundamento mínimo aceptado | URLs recuperadas y al menos una fuente clasificada tier 1/2 | `insufficient_sources`, sin publicación del artefacto ni fallback; conservar fallo | [ruta fallida](../Fase5-evidencia-Tavily/route-error-1789237107474.json) |
| 3. Mezcla de convenciones — OBSERVADO | DSO equipara ventas netas/totales/a crédito sin condiciones; segundo DSO no explicita promedio/netas | Enseñanza y evaluación contradictorias | Regla general de convención consistente, fuentes y revisión | Detener antes de score, preservar ambas; no regenerar indefinidamente | [DSO](corridas/corrida-02-dso/pedagogical-review.json), [iteración](corridas/corrida-02-dso-reanudacion/pedagogical-review.json) |
| 4. Confundir validez JSON con verdad — OBSERVADO | Ambas DSO pasan JSON/AJV pese al defecto pedagógico | Aprobación indebida basada en status técnico | Separar validación estructural de revisión semántica humana | Veto humano; `completed` no acredita calidad | [revisión DSO](corridas/corrida-02-dso/pedagogical-review.json) |
| 5. Acceso/fallo Gemini — OBSERVADO para modelo histórico | Gemini 2.5 Flash devolvió 404 NOT_FOUND pese a metadatos visibles | No se puede generar; flujo dependiente bloqueado | Errores explícitos, timeout 60 s, sin cambio silencioso de modelo | Fallar run si se puede guardar, informar; decisión humana sobre siguiente acción | [404 real](../Fase5-evidencia-real/V2-error.json), [agente](server/agent.js) |
| 6. Tavily/cuota/pago — PREVISTO | 402, 429/432/433, transporte o respuesta no JSON | Búsqueda interrumpida; posible consumo sin resultado útil | Límite basic/cinco resultados, timeout 60 s, sin retry de búsqueda | Pago/cuota/búsqueda fallida según código; nunca activar billing | [ramas implementadas](server/agent.js), [Fase 5](../Informe-Fase5-Gemini.txt) |
| 7. Persistencia fallida — PREVISTO operativo; incidencia local histórica | DB no inserta intento/artefacto o no finaliza run | Resultado no confirmado; traza parcial o run completo sin artefacto guardado | Transacción de intento, constraints/triggers, respuesta sólo tras guardado | `database_error` cuando error SQLite llega al middleware; inspección humana, sin prometer reparación | [store](server/store.js), [API](server/app.js), [incidencia histórica](../Informe-Segunda-Mision-Metricamente.txt) |
| 8. Rerun variable — OBSERVADO | DSO y rutas cambian entre ejecuciones | No se reproduce el texto mediante otra llamada | Congelar outputs/IDs/prompts y manifests | Reconstruir artefactos; nueva ejecución separada si se autoriza | [índice académico](corridas/README.md) |
| 9. UUID/pérdida/suplantación — PREVISTO | Borrar localStorage pierde vínculo; conocer UUID permite usar perfil | Progreso inaccesible localmente o acceso indebido | Vincular filtros al UUID declarado; uso local | No inventar historial ni recuperación; revisión del operador antes de compartir | [frontend](app.js), [API](server/app.js) |
| 10. Exposición de claves — PREVISTO | Credencial copiada a log, prompt, documento o paquete | Uso no autorizado de proveedor | Claves servidor, redacción y lista pública; revisión de entregables | Detener distribución; operador revoca/rota credencial si se expone y trata copia por canal seguro | [redacción](server/agent.js), [.gitignore](.gitignore) |
| 11. Avance/decisión indebidos — PREVISTO | Interpretar recomendación o ausencia de respuesta como ACCEPT | Actividad sin decisión humana | Herramientas sin escritura; endpoint de decisión separado; clic explícito | No avanzar; revisar registros. Botón que acepta e inicia requiere clic humano | [frontend](app.js), [SLA](corridas/corrida-01-sla/human_decision.json), [RRHH](corridas/corrida-03-ruta-rrhh/human_decision.json) |
| 12. Fuente errónea incorporable — OBSERVADO como material recuperado | Snippet Sage con fórmula de rotación aparentemente problemática | Propagación de error si se copia sin evaluar | Revisar contenido, no sólo dominio/tier | No reproducir afirmación problemática; limitar aceptación al artefacto revisado | [RRHH revisión](corridas/corrida-03-ruta-rrhh/pedagogical-review.json) |
| 13. Instrucciones hostiles en fuentes — PREVISTO | Texto web/intención intenta sustituir contrato o consultar otro usuario | Contenido desviado o intento de exceder permisos | Prompt trata fuentes como datos; tool scope validado, URLs permitidas, DOM/textContent | Rechazar tool fuera de alcance y revisar contenido; no afirmar inmunidad a prompt injection | [prompt](prompts/system_prompt.md), [agente](server/agent.js) |
| 14. Modificación/exposición de evidencia — PREVISTO | Administrador cambia archivos o comparte snapshot con información privada | Pérdida de integridad/confidencialidad | Exportación sin sobrescritura, manifiestos y custodia humana | Verificar hash; conservar original autorizado y registrar incidencia, no maquillar outputs | [exportador](scripts/export-run.js), [índice](corridas/README.md) |

Las respuestas humanas propuestas (revocar una clave, revisar custodia, detener distribución) son procedimientos, no automatismos incorporados. Los triggers no proporcionan protección contra un administrador hostil del host.

## H. Fallas observadas y su interpretación

Se usan el 404 crudo de Gemini 2.5 Flash, `insufficient_sources` de Fase 5, revisión CAC, ambas revisiones DSO y revisión del snippet RRHH, enlazados en la matriz. El rechazo 2.5 Flash-Lite también figura en la historia, pero no se localizó un log independiente de aquella prueba aislada: no se inventa ni se atribuye a ese modelo el JSON de Flash.

CAC tuvo una corrección mínima y un quiz nuevo aceptable, sin editar el primero. DSO tuvo una única regla general adicional y otra ejecución fallida; luego se decidió no regenerar. RRHH no copió la fórmula problemática y no generó módulos: es una aceptación acotada de la ruta, no una aprobación universal de sus fuentes.

Las ramas cuota/pago no aparecieron como fallos externos reales en las llamadas preservadas de integración. Los 21 tests previos y la inspección de código no se presentan como prueba de una cuota real agotada. No se repitió ninguna de esas pruebas aquí.

## I. Respuestas reales a fallas y límites de recuperación

| Caso solicitado | Comportamiento implementado | Límite / condición |
|---|---|---|
| `tool_error` | **No existe un código genérico literal con ese nombre.** Se usan `tool_protocol_error` (502) para llamada requerida ausente/incorrecta y `tool_scope_error` (403 progreso; 422 query) para argumentos fuera de alcance | Otras excepciones no AppError dentro del agente se normalizan como `agent_error` 500 si puede finalizar el run |
| `insufficient_sources` | 422 ante ausencia de fuentes trazables, selección sin tier 1/2 o respuesta estructurada de insuficiencia | No se guarda módulo/ruta como artefacto exitoso ni se usa conocimiento interno como sustitución. Puede preservarse output del run fallido para diagnóstico |
| `configuration_required` | 503 por credencial Gemini ausente o Tavily ausente al llegar a búsqueda | Gemini faltante se comprueba tras iniciar run; Tavily faltante puede detectarse después de consumir llamadas Gemini previas. Health no valida cuota ni Tavily |
| `quota_exceeded` | Gemini status 429; Tavily 429/432/433 se comunican como 429 | No retry de transporte/cuota ni activación de pago; patrón no observado externamente en la muestra |
| `paid_tier_required` | Gemini por texto de error reconocido; Tavily HTTP 402 con respuesta JSON procesable → 402 | Clasificación Gemini depende del mensaje; no es consulta de billing. Tavily no JSON falla antes de clasificación por status |
| `search_failed` | 502 para petición Gemini de etapa search fallida, Tavily transporte/no JSON/otros errores HTTP | Timeout 60 s; no nueva búsqueda automática |
| Gemini general / respuesta incompleta | `api_error` 502 para otros errores externos; `model_refusal` 422 por bloqueo; `incomplete_response` 502 por respuesta ausente/inconclusa | SDK `retryOptions.attempts=1`; no fallback de proveedor/modelo. Detalles redactados en traza cuando se conserva |
| Invalid structured output | `invalid_output` 422; **un único reintento estructural** con misma evidencia | Máximo dos salidas estructuradas; si vuelve a fallar se detiene. No reintenta insuficiencia de fuentes ni revisión pedagógica |
| DB failure | Middleware mapea códigos `SQLITE*` a `database_error` 503 y dice que no se confirmó guardado; intento se guarda en transacción | Un fallo de lectura dentro del agente puede normalizarse a `agent_error`; si falla `startRun`/`finishRun`, la traza puede faltar o quedar `running`. No hay rescate infalible del log |
| Pedagogical rejection | Revisión humana detiene flujo y conserva diagnóstico/outputs | No es código de error del agente ni un filtro semántico automático; un run técnicamente `completed` puede ser pedagógicamente FAIL |
| Respuestas ya guardadas | Mismo envío devuelve mismo intento; distinto devuelve `attempt_locked` 409 | No edita intento. Nueva evaluación requiere otro quiz |

**Persistencia no es una transacción global del flujo agéntico.** `run` puede finalizar `completed` antes de `addModule`, `addRoute` o `addQuiz`. Si esa inserción posterior falla, no debe concluirse que el artefacto quedó guardado sólo por mirar el status del run. Revisar respuesta HTTP y tablas/snapshot. Tampoco se promete que todo fallo externo tenga log persistido si la base está caída.

Si el feedback falla después de un intento, el frontend informa el problema y mantiene el resultado previamente guardado; no se invalida ni recalcula por IA. Una decisión ACCEPT registrada puede preceder a una actividad explícitamente elegida que luego falle; aceptación no prueba ejecución exitosa.

## J. Documentos y separación de responsabilidades

- `GOBIERNO.md`: documento formal de permisos, acciones, L2, responsable, ausencia, matriz y respuestas, además de este cierre A–M.
- `README.md`: enlace breve y resumen; se conserva como guía de uso.
- `DECISIONES.md`: D28 añadido para registrar la formalización operativa; D01–D27 no se reescriben.

No se modifica ninguna corrida, manifest, output, prompt ni informe histórico. Publicación en GitHub y distribución requieren decisión humana aparte; esta fase no realiza esas acciones.

## K. QA documental y secretos

Revisión offline de agente, API, store/database, validación y frontend; cotejo con evidencias enlazadas; verificación de rutas, L2, responsable y distinción entre políticas y controles reales. Escaneo de credenciales en documentos modificados y comparación de hashes del proyecto para asegurar alcance. No se muestran claves ni se leen en outputs; su comparación se realiza en memoria.

`.env` permanece local/ignorado y no entregable; los snapshots académicos no están automáticamente excluidos por el patrón `corridas/*.json`, que sólo cubre archivos directamente bajo corridas. La custodia humana y el examen de privacidad antes de compartir siguen siendo necesarios. SHA-256 permite verificar integridad respecto del manifiesto disponible, no firma la autenticidad del proveedor.

Resultados de QA: 139 referencias locales con destino existente; 85 entradas de manifiestos verificadas sin fallos; cero coincidencias de claves en los tres documentos modificados. Comparación SHA-256 de 125 archivos: sólo README.md, DECISIONES.md y el nuevo GOBIERNO.md cambiaron; cero eliminaciones. D01–D27 permanecen íntegros como prefijo, con D28 añadido. Diff-check sin errores de espacios; Git informó únicamente normalización LF/CRLF del documento nuevo.

## L. Producción y gaps reales

Metricamente es un **sistema académico funcional / prototipo serio**, no un producto multiusuario público listo para producción. UUID no es autenticación ni protección de cuenta; revisión pedagógica sigue siendo humana; proveedores tienen cuotas/disponibilidad; no hay SLA operativo de producción. Esto describe el alcance de entrega, no invalida las corridas académicas.

Persisten ausencia de cola/bloqueo técnico `PENDING REVIEW`, ausencia de firma humana autenticada, falta de revisión semántica garantizada y recuperación de identidad entre dispositivos. No se garantiza trazabilidad completa bajo caída SQLite ni atomicidad de generación más persistencia. La exclusión de concurrencia por UUID dentro de un proceso no es protección integral de abuso ni presupuesto global.

Los controles de prompt injection, secretos y fuentes reducen riesgo, no lo eliminan. No se afirma cumplimiento legal/certificación de seguridad ni se evalúan términos actuales de proveedores en esta misión. Consumo y sostenibilidad se documentan separadamente en [ECONOMIA.md](ECONOMIA.md).

## M. Conclusión

**FASE 10 COMPLETE.** Permisos y prohibiciones documentados contra implementación; L2 y autoridad humana fundamentados en SLA/DSO/RRHH; ausencia del responsable definida como regla operativa sin inventar automatización; 14 riesgos específicos con evidencia y respuestas reales.

Sin llamadas externas, nuevas corridas, cambios funcionales o Fase 11. Sin commit/push/PR/merge.
