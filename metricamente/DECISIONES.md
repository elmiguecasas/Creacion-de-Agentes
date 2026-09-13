# DECISIONES — historia verificable de Metricamente

Consolidación de Fase 8, 12 de septiembre de 2026. Este documento explica por qué y cómo se llegó al sistema; el [README](README.md) describe qué hace y cómo usarlo. La versión anterior se conserva íntegra en [DECISIONES antes de Fase 8](../DECISIONES-antes-Fase8.md), sin corregir retrospectivamente sus estados pendientes.

## Criterio de lectura

Las decisiones están ordenadas por etapa y dependencia temporal. Cuando no hay fecha individual comprobable se indica fase, sin inventar hora ni fecha de aprobación. El informe de Segunda Misión y los cierres Fase 5–7 están fechados el 12/09/2026; las decisiones conceptuales los anteceden. «Alternativas» sólo describe opciones registradas; su ausencia no se rellena con un debate supuesto.

Se distingue implementación, verificación externa, declaración histórica y recomendación pendiente. Un informe acredita lo reportado en esa etapa; no equivale a disponer de un log independiente de cada prueba aislada. Los documentos y outputs históricos conservan nombres y estados de su momento.

**Estado operativo actual:** un agente con Gemini `gemini-3.5-flash-lite`, Tavily / `search_metric_sources`, `get_learning_progress`, Structured Outputs + AJV y SQLite/scoring por código. Fase 6 COMPLETE con DSO pedagógicamente fallida. Fase 8 sólo consolida historia y armoniza una instrucción del prompt; no valida mediante inferencia esa nueva versión.

### D01 — Reutilizar Entrega 1

**Fecha/fase:** diagnóstico y Segunda Misión, anteriores al cierre del 12/09/2026. **Estado:** implementada.

**Contexto y alternativas:** ya existían HTML/CSS/JS, cinco métricas de Operaciones, contenido/banco hardcoded, quiz, scoring local y localStorage. Se optó por evolucionar ese trabajo frente a reconstruir el frontend.

**Decisión y razón:** preservar identidad visual y recorrido estudio → quiz → resultado → feedback; mantener README.txt y transformar los temas en seeds para reducir reescritura y conservar continuidad.

**Evidencia:** [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt), [README.txt](README.txt), [seeds](data/seeds.json).

**Resultado/impacto:** frontend reutilizado y adaptado; backend, LLM, búsqueda, SQLite, herramientas, JSON estructurado, scoring servidor, feedback, rutas y evidencia incorporados después. **Límite:** conservar no significa que app.js haya quedado idéntico al MVP. Entrega 2 no fue consultada.

### D02 — Abrir el tutor a áreas e indicadores

**Fecha/fase:** definición conceptual anterior a implementación. **Estado:** implementada dentro del alcance del Trabajo Final.

**Contexto y alternativas:** catálogo cerrado de cinco métricas frente a entrada por intención. La visión aprobada abarca métricas, indicadores y sistemas de medición de distintas actividades.

**Decisión y razón:** permitir concepto específico y ruta por dominio, con seeds como ayuda inicial; responder al objetivo del usuario sin limitar el universo a Operaciones/KPIs.

**Evidencia:** [contrato](prompts/system_prompt.md), [interpret schema](schemas/interpret.schema.json), [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt).

**Resultado/impacto:** modos reales `metric`, `area` y `clarify`; módulos y rutas dinámicos. **Límite:** entrada abierta no prueba cobertura ni exactitud para toda métrica posible.

### D03 — Separar generación y controles determinísticos

**Fecha/fase:** Segunda Misión. **Estado:** vigente.

**Contexto y alternativas:** la IA genera y recomienda; la corrección oficial debe ser reproducible. No se delegó scoring al modelo.

**Decisión y razón:** JSON Schema + AJV y validaciones por código para artefactos; `scoreQuiz` compartida con autoridad final del servidor; usar el intento persistido como entrada del feedback.

**Evidencia:** [scoring](shared/scoring.js), [validación](server/validation.js), [API](server/app.js).

**Resultado/impacto:** cinco respuestas, 20 puntos por acierto; el cliente no puede fijar un score externo. **Límite:** validar estructura o referencias no demuestra corrección pedagógica; las claves llegan al navegador para autoaprendizaje.

### D04 — Backend mínimo, SQLite e identidad UUID

**Fecha/fase:** Segunda Misión. **Estado:** implementada.

**Contexto y alternativas:** localStorage resumido no bastaba para herramientas e intentos reconstruibles. El alcance aprobado era ligero/local, sin login completo.

**Decisión y razón:** Node/Express, better-sqlite3, UUID de navegador y progreso derivado; sin ORM, Docker ni infraestructura adicional. Se utilizó Node 24.19.0 disponible frente al runtime predeterminado 18.14.2 incompatible, sin instalar uno global.

**Evidencia:** [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt), [database](server/database.js), [store](server/store.js), [package](package.json).

**Resultado/impacto:** estado accesible al backend y herramienta read-only; almacenamiento legacy separado, sin fabricar intentos. **Límite:** UUID no autentica; conocerlo permite suplantar perfil y perderlo rompe la asociación local.

### D05 — Congelar quizzes y preservar evidencia

**Fecha/fase:** Segunda Misión. **Estado:** implementada.

**Contexto y alternativas:** sobrescribir intentos/artefactos impediría reconstrucción. No se registró una alternativa de almacenamiento inviolable.

**Decisión y razón:** artefactos/versiones e intentos append-only con triggers; runs `running` finalizan una vez; guardar requests/responses, prompts, schemas, hashes, fuentes, opciones y claves presentadas. Reenvío idéntico es idempotente; otro intento requiere otro quiz.

**Evidencia:** [database](server/database.js), [store](server/store.js), [exportador](scripts/export-run.js).

**Resultado/impacto:** reconstrucción del original generado y de la instancia mezclada, sin editarlos. **Límite:** un administrador SQLite podría alterar la base; un manifiesto prueba integridad relativa, no procedencia externa. Un run interrumpido no es éxito.

### D06 — Corregir sesgo de posición y acotar variación

**Fecha/fase:** Segunda Misión. **Estado:** implementada.

**Contexto y alternativas:** el registro inicial detectó 26 de 30 claves en la primera opción. Se conservó el contenido en vez de cambiar respuestas correctas.

**Decisión y razón:** mezclar opciones/preguntas con Fisher–Yates y `crypto.randomInt`, recalcular la posición correcta y congelarla antes de mostrarla. En seeds elegir cinco de seis priorizando una no presente en el último quiz; en dinámicos aportar el último quiz y rechazar el conjunto exacto repetido.

**Evidencia:** [historia anterior](../DECISIONES-antes-Fase8.md), [quizzes](server/quizzes.js), [tests locales existentes](tests/core.test.js).

**Resultado/impacto:** corrección reproducible pese al orden variable. **Límite:** cuatro preguntas seed pueden repetirse; no se demuestra diversidad semántica de paráfrasis.

### D07 — Primera implementación con OpenAI

**Fecha/fase:** Segunda Misión, cierre 12/09/2026. **Estado:** histórica, sustituida.

**Contexto y alternativas:** primera integración aprobada de un solo agente; no se documentó una comparación adicional de proveedores en esa etapa.

**Decisión y razón:** Responses API con `gpt-5.6-luna` configurable, Web Search alojado y function calling de progreso, manteniendo AJV y controles propios.

**Evidencia:** [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt), [registro anterior](../DECISIONES-antes-Fase8.md).

**Resultado/impacto:** implementación y 21 tests locales con dobles explícitos; cuatro escenarios de navegador y arranque reportados PASS. **Límite:** sin OPENAI_API_KEY, no hubo inferencia OpenAI acreditada; smoke terminó código 2. No confundir implementación con validación externa. El proveedor ya no está operativo.

### D08 — Ajustes mínimos e incidencias de implementación

**Fecha/fase:** Segunda Misión. **Estado:** correcciones históricas, conservadas.

**Contexto y alternativas:** se necesitaron artefactos de interpretación, rutas y decisiones, sin añadir funcionalidades del roadmap.

**Decisión y razón:** añadir interpret schema, tablas routes/decisions, endpoints auxiliares y relaciones módulo/version/usuario. Corregir sintaxis de herramienta/helper, placeholder extra de INSERT agent_runs y referencia mutable del log mediante `structuredClone`.

**Evidencia:** [registro anterior](../DECISIONES-antes-Fase8.md), [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt), [agente vigente](server/agent.js).

**Resultado/impacto:** tests detectaron `database_error`; las correcciones permitieron persistencia y snapshots de requests estables. Chrome instalado suplió Chromium ausente en QA. **Límite:** son incidencias reportadas históricamente, no nuevas reproducciones realizadas en esta auditoría.

### D09 — Evitar gasto y no activar billing

**Fecha/fase:** transición a Fase 5. **Estado:** restricción mantenida.

**Contexto y alternativas:** se decidió buscar ejecución sin habilitar facturación; conservar la primera integración no satisfacía el objetivo de pruebas bajo esa restricción.

**Decisión y razón:** migrar proveedor de forma acotada, comprobar disponibilidad real y devolver decisiones de modelo a Chat; no activar pago ni sustituir modelo silenciosamente ante errores.

**Evidencia:** [informe Fase 5 anterior a Tavily](../Informe-Fase5-Gemini-antes-Tavily.txt), [cierre Fase 5](../Informe-Fase5-Gemini.txt).

**Resultado/impacto:** proyecto Gemini declarado gratuito por el usuario y pruebas sin habilitar billing. **Límite:** esa declaración y usage exitoso no certifican costo monetario cero ni condiciones futuras de las cuentas.

### D10 — Migración inicial a Gemini 2.5 Flash

**Fecha/fase:** Fase 5, 12/09/2026. **Estado:** integración histórica reemplazada.

**Contexto y alternativas:** sustituir sólo la capa OpenAI frente a rediseñar. La primera elección fue `gemini-2.5-flash` con Google Search Grounding.

**Decisión y razón:** @google/genai, generateContent, function declarations para progreso y responseJsonSchema; mantener cinco schemas completos, AJV, SQLite, scoring, frontend y supervisión. Ajustar referencias residuales de health/smoke a credencial Gemini.

**Evidencia:** [registro anterior](../DECISIONES-antes-Fase8.md), [informe anterior](../Informe-Fase5-Gemini-antes-Tavily.txt).

**Resultado/impacto:** regresión local reportada PASS, inicialmente bloqueada por clave ausente y después por acceso al modelo. **Límite:** ningún fixture prueba grounding/inferencia real. No se simplificaron schemas sin error real que lo justificara.

### D11 — Preservar el 404 real de Gemini 2.5 Flash

**Fecha/fase:** reanudación real Fase 5, 12/09/2026. **Estado:** fallo de acceso observado; candidato abandonado.

**Contexto y alternativas:** models.get respondió, pero eso no garantizó generateContent. La API sugería otro modelo e Interactions; esa sugerencia no autorizaba migración.

**Decisión y razón:** detener las pruebas dependientes y conservar el error sin interpretarlo como fallo de schema o pago requerido.

**Evidencia:** [V2-error.json](../Fase5-evidencia-real/V2-error.json), [V3-error.json](../Fase5-evidencia-real/V3-error.json), [V4-error.json](../Fase5-evidencia-real/V4-error.json), [verificación](../Fase5-evidencia-real/verification.json).

**Resultado/impacto:** HTTP 404 / NOT_FOUND. Texto conservado: “This model models/gemini-2.5-flash is no longer available to new users.” Cinco solicitudes reales fallaron; módulo/ruta dejaron runs fallidos. **Límite:** no hubo usage ni grounding exitoso; la sugerencia `gemini-3.6-flash` del error no se convirtió en arquitectura.

### D12 — Verificación mínima de Gemini 2.5 Flash-Lite

**Fecha/fase:** Fase 5, después del fallo Flash y antes de validar 3.5. **Estado:** candidato rechazado según historia y confirmación del usuario.

**Contexto y alternativas:** visibilidad en Models/List frente a acceso real; se autorizó una llamada mínima al candidato estable de bajo costo.

**Decisión y razón:** probar inferencia aislada antes de ejecutar V1–V11 o cambiar permanentemente el modelo.

**Evidencia:** [registro anterior](../DECISIONES-antes-Fase8.md), [historia del cierre Fase 5](../Informe-Fase5-Gemini.txt); el usuario confirmó en la solicitud posterior que no estaba disponible para usuarios nuevos.

**Resultado/impacto:** esos registros reportan 404 de Flash/Flash-Lite para nuevos usuarios; se dejó de considerar 2.5 Flash-Lite. **Límite documental:** no se localizó un JSON independiente de esa llamada aislada en la evidencia técnica inspeccionada. No se copia el mensaje de Flash atribuyéndoselo a Flash-Lite ni se inventan status/usage adicionales.

### D13 — Validar Gemini 3.5 Flash-Lite antes de integrar

**Fecha/fase:** Fase 5, posterior a D12. **Estado:** proveedor vigente validado.

**Contexto y alternativas:** el usuario autorizó `gemini-3.5-flash-lite` como siguiente candidato, sin migrar a Interactions ni ejecutar otras capacidades todavía.

**Decisión y razón:** comprobar inferencia mínima y después reutilizar generateContent en la integración aprobada.

**Evidencia:** [V1](../Fase5-evidencia-Tavily/V1.json), [V2 real](../Fase5-evidencia-Tavily/V2.json), [informe Fase 5](../Informe-Fase5-Gemini.txt).

**Resultado/impacto:** evidencia posterior de integración confirma texto `OK`, modelo efectivo 3.5 Flash-Lite y usage 6 prompt / 1 candidate / 7 total. **Límite:** ese artefacto acredita la verificación preservada, no pretende ser el log de toda llamada aislada anterior. La respuesta SDK exitosa no expone código HTTP explícito y no certifica free tier por sí sola.

### D14 — No conservar Google Search Grounding como búsqueda operativa

**Fecha/fase:** Fase 5, selección de búsqueda tras validar 3.5. **Estado:** alternativa histórica descartada para este alcance.

**Contexto y alternativas:** Grounding de Google no satisfacía la restricción API Free Tier evaluada para el modelo; se consideró separar búsqueda externa con Tavily.

**Decisión y razón:** no habilitar pago para conservar grounding; evaluar una herramienta externa real sin cambiar el resto del sistema.

**Evidencia:** [cierre Fase 5, historia y arquitectura](../Informe-Fase5-Gemini.txt), [registro anterior](../DECISIONES-antes-Fase8.md).

**Resultado/impacto:** Grounding dejó de ser dependencia operativa. **Límite:** es una decisión basada en la evaluación documental de aquella etapa, no un error de billing experimental ni una nueva comprobación de tarifas en Fase 8. No se afirma que todos los modelos/planes carezcan de grounding gratuito.

### D15 — Validar Tavily y aprobar su adopción

**Fecha/fase:** Fase 5, antes de integrar la búsqueda. **Estado:** adoptada.

**Contexto y alternativas:** conservar Grounding incompatible con la restricción o usar Tavily tras prueba mínima. El usuario configuró la clave y autorizó búsqueda aislada antes de modificar Metricamente.

**Decisión y razón:** aceptar Tavily como búsqueda externa después de autenticación/respuesta reales; no considerar resultados de prueba como evidencia académica final.

**Evidencia:** [historia anterior](../DECISIONES-antes-Fase8.md), [informe Fase 5, apartados B/E](../Informe-Fase5-Gemini.txt), [snapshot de integración posterior](../Fase5-evidencia-Tavily/snapshot-final.json).

**Resultado/impacto:** historia reporta HTTP 200 y un crédito en validación aislada; integración preservada acredita tres búsquedas HTTP 200, cinco resultados y un crédito cada una. **Límite:** el informe separa esas búsquedas de la prueba aislada previa; no hay que sumarlas como si fueran el mismo evento ni inferir plan de cuenta del crédito.

### D16 — Integración final Gemini + Tavily

**Fecha/fase:** cierre Fase 5, 12/09/2026. **Estado:** vigente.

**Contexto y alternativas:** reemplazar únicamente búsqueda/proveedor frente a rediseñar herramientas, persistencia o frontend.

**Decisión y razón:** un agente 3.5 Flash-Lite solicita progreso y, para módulo/ruta, `search_metric_sources`. Backend valida query, ejecuta Tavily basic/máximo cinco resultados/sin retry y normaliza contenido; Structured Outputs y AJV se mantienen.

**Evidencia:** [agent.js](server/agent.js), [informe Fase 5](../Informe-Fase5-Gemini.txt), [verificación real](../Fase5-evidencia-Tavily/verification.json).

**Resultado/impacto:** function calling real de ambas herramientas, trazas nativas y normalizadas, fuentes y usage por proveedor; no se agregaron dependencias para Tavily. No se cambió SQLite/scoring ni se migró a Interactions. **Límite:** URLs trazables no certifican verdad; autoridad tier 1/2 requiere juicio. No hay fallback silencioso si faltan fuentes.

### D17 — Fallo pedagógico CAC y corrección mínima

**Fecha/fase:** V7 de Fase 5. **Estado:** defecto original preservado; retest aceptable para la muestra.

**Contexto y alternativas:** `q4_cac_common_mistake` preguntaba por un error y tenía otros errores válidos como distractores. No se autorizó retocar la clave o el output para aprobarlo.

**Decisión y razón:** añadir regla general al system prompt para contrastar las cuatro alternativas y usar prácticas correctas como distractores en preguntas sobre errores; generar otro quiz con IDs nuevos.

**Evidencia:** [quiz defectuoso](../Fase5-evidencia-Tavily/quiz-initial-pedagogical-issue.json), [revisión](../Fase5-evidencia-Tavily/pedagogical-review.json), [quiz posterior](../Fase5-evidencia-Tavily/quiz.json), [informe Fase 5, G/H](../Informe-Fase5-Gemini.txt).

**Resultado/impacto:** original sin intento, preservado; nuevo quiz aceptable tras revisión y 21 tests reportados PASS. Se puntuó un intento posterior 60/100. **Límite:** no es garantía general; no se cambió schema, scoring ni número de agentes.

### D18 — Preservar incidencias y separar validación técnica de académica

**Fecha/fase:** Fase 5, cierre. **Estado:** READY técnico histórico.

**Contexto y alternativas:** hubo un request mínimo INVALID_ARGUMENT y una ruta `insufficient_sources`. Obtener un PASS final no debía borrar esos eventos ni convertir tests en corridas académicas.

**Decisión y razón:** retirar config opcional heredada únicamente del harness mínimo; no atribuir el error a una keyword aislada sin prueba. Para la ruta, mantener política y ejecutar una nueva solicitud explícita, sin retry automático.

**Evidencia:** [V2-error](../Fase5-evidencia-Tavily/V2-error.json), [ruta fallida](../Fase5-evidencia-Tavily/route-error-1789237107474.json), [route-control](../Fase5-evidencia-Tavily/route-control.json), [informe Fase 5](../Informe-Fase5-Gemini.txt).

**Resultado/impacto:** mínimo OK; ruta posterior con fuentes tier 2, luego REJECT explícito para probar supervisión. V1–V11 reportadas PASS con incidencias; 21 tests, navegador y startup acreditados en esa fase. **Límite:** `integration_test_NOT_academic`; no cuenta como SLA, DSO o RRHH final, ni el REJECT implica fallo pedagógico de esa ruta.

### D19 — Adoptar L2 como convención operativa

**Fecha/fase:** Fase 6, presente desde SLA; ratificada en cierre y Fase 7. **Estado:** vigente; armonización literal posterior en D25.

**Contexto y alternativas:** no había definiciones oficiales publicadas L0–L4; inicialmente se dejó la etiqueta pendiente. Se adoptó L2 para describir el flujo real, sin inventar una norma de cátedra.

**Decisión y razón:** L2 — Autonomía supervisada. Agente interpreta, consulta progreso, busca, genera, analiza y recomienda; humano inicia, responde, revisa, acepta/rechaza y decide siguiente paso.

**Evidencia:** [SLA](corridas/corrida-01-sla/README.md), [cierre Fase 6](../Informe-Fase6-Final.txt), [Fase 7](../Informe-Fase7.txt).

**Resultado/impacto:** SLA ACCEPT sin repaso; DSO detenido antes de scoring; RRHH ACCEPT sin módulos. **Límite:** endpoint sólo registra; botones pueden aceptar e iniciar la actividad elegida con un clic humano. No existe garantía automática de revisión pedagógica de todo módulo.

### D20 — Corrida 1 SLA: continuidad y flujo completo

**Fecha/fase:** Fase 6. **Estado:** PASS, preservada sin repetición.

**Contexto y alternativas:** demostrar el flujo completo con continuidad del seed, sin presentarlo como generación externa de módulo.

**Decisión y razón:** input «Quiero aprender SLA», quiz nuevo congelado, respuestas deliberadas, scoring oficial, feedback real y decisión humana explícita.

**Evidencia:** [README SLA](corridas/corrida-01-sla/README.md), [attempt](corridas/corrida-01-sla/attempt.json), [decisión](corridas/corrida-01-sla/human_decision.json).

**Resultado/impacto:** 60/100, tres aciertos; recomendación de repaso de fórmula y reporte; ACCEPT registrado sin iniciar repaso. **Límite:** no hubo Tavily para el seed y las respuestas no evalúan académicamente al autor. Su usage no se regeneró ni se recalculó mediante nuevas llamadas.

### D21 — DSO original: detener antes de puntuar

**Fecha/fase:** Fase 6, Corrida 2 original. **Estado:** técnicamente válida, pedagógicamente rechazada.

**Contexto y alternativas:** módulo y quiz pasaron JSON/AJV, pero mezclaron convenciones. Puntuar hubiera legitimado una evaluación ambigua.

**Decisión y razón:** preservar outputs, detener antes de respuestas/attempt/score/feedback y volver a Chat antes de cualquier corrección.

**Evidencia:** [revisión DSO](corridas/corrida-02-dso/pedagogical-review.json), [módulo](corridas/corrida-02-dso/module.json), [quiz](corridas/corrida-02-dso/quiz.json), [informe inicial Fase 6](../Informe-Fase6.txt).

**Resultado/impacto:** fórmula «Ventas Totales a Crédito o Netas» sin supuestos; `q2_dso_formula` aceptaba ventas totales o a crédito como equivalentes, mientras `q4_dso_mistake` penalizaba confundirlas. El ejemplo 50000/100000×30=15 era aritméticamente correcto pero metodológicamente ambiguo. **Límite:** fuentes trazables no justifican equivalencia; revisión limitada al content recuperado, sin afirmar lectura completa adicional de las páginas.

### D22 — Regla general y segunda DSO fallida

**Fecha/fase:** reanudación focalizada Fase 6. **Estado:** corrección aplicada entonces; iteración pedagógicamente rechazada.

**Contexto y alternativas:** se autorizó una regla general, no una regla especial DSO ni cambios de schemas/scoring.

**Decisión y razón:** seleccionar y sostener convención principal entre fórmula, ejemplo y quiz, explicitando condiciones/proxies; ejecutar «Quiero aprender DSO» con nuevos IDs y carpeta, sin repetir SLA ni sobrescribir la original.

**Evidencia:** [revisión reanudación](corridas/corrida-02-dso-reanudacion/pedagogical-review.json), [módulo](corridas/corrida-02-dso-reanudacion/module.json), [informe reanudación](../Informe-Fase6-Reanudacion.txt).

**Resultado/impacto:** fórmula `DSO = (Accounts Receivable / Total Credit Sales) * Number of Days` no explicitó promedio/netas; ejemplo no definió saldo promedio o final. `q_dso_04` trató saldo final como distractor no erróneo sin condiciones. Aritmética 45.625 correcta, convención solicitada incumplida. **Límite:** no toda variante con saldo final es inválida; el defecto es falta de condiciones y consistencia. Segundo fallo sin score/feedback; no se aplicó otra corrección pedagógica.

### D23 — Aceptar DSO como evidencia académica fallida y detener regeneraciones

**Fecha/fase:** cierre eficiente Fase 6, después de la reanudación. **Estado:** decisión académica explícita del usuario.

**Contexto y alternativas:** insistir en regenerar frente a conservar lo realmente observado. La consigna exige corridas reales reconstruibles, no outputs perfectos.

**Decisión y razón:** no corregir ni regenerar DSO otra vez. La original permanece Corrida 2: **REAL RUN — PEDAGOGICAL FAILURE PRESERVED**. La segunda se conserva como iteración, no sustitución ni cuarta corrida final.

**Evidencia:** [informe final Fase 6](../Informe-Fase6-Final.txt), [índice académico](corridas/README.md), ambas revisiones de DSO citadas arriba.

**Resultado/impacto:** se pudo continuar RRHH sin ocultar el fallo. No se reescribieron estados BLOCKED históricos ni se inventaron intentos/decisiones ACCEPT de contenido DSO. **Límite:** ninguna DSO está pedagógicamente aprobada. JSON/AJV válido no garantiza exactitud; se detuvo tras una reanudación autorizada, sin buscar repetidamente un resultado favorable.

### D24 — Corrida 3 RRHH y cierre Fase 6

**Fecha/fase:** cierre Fase 6. **Estado:** PASS; tres corridas académicas reales completas como evidencia.

**Contexto y alternativas:** demostrar ruta por dominio con consumo mínimo; no regenerar para mejorar redacción ni iniciar módulos de la propuesta.

**Decisión y razón:** input exacto «Quiero aprender métricas de Recursos Humanos» → interpretación → progreso → Tavily → ruta/AJV/persistencia → revisión → ACCEPT autorizado.

**Evidencia:** [RRHH README](corridas/corrida-03-ruta-rrhh/README.md), [ruta](corridas/corrida-03-ruta-rrhh/route.json), [revisión](corridas/corrida-03-ruta-rrhh/pedagogical-review.json), [decisión](corridas/corrida-03-ruta-rrhh/human_decision.json), [cierre](../Informe-Fase6-Final.txt).

**Resultado/impacto:** rotación → costo por contratación → absentismo → ingresos por empleado; Tavily real, ACCEPT, ningún módulo/quiz/attempt iniciado. SLA + DSO original + RRHH cumplen tres ejecuciones distintas reconstruibles. **Límite:** snippet Sage aparentemente invertía fórmula de rotación; la ruta no la reprodujo. PASS de ruta no valida módulos no generados.

### D25 — Armonizar L2 después de las corridas

**Fecha/fase:** discrepancia detectada en Fase 7; modificación expresamente autorizada en Fase 8, 12/09/2026. **Estado:** aplicada sin reejecución.

**Contexto y alternativas:** la etiqueta L2 ya describía la supervisión, pero el prompt seguía prohibiendo asignarla. Fase 7 reportó la discrepancia y preservó el contrato; Fase 8 autoriza sólo reemplazar esa instrucción.

**Decisión exacta:** en [system_prompt.md](prompts/system_prompt.md), sustituir:

> No asignes una etiqueta L0–L4: sus definiciones oficiales están pendientes.

por:

> Metricamente adopta L2 — Autonomía supervisada como convención operativa del proyecto ante ausencia de definiciones oficiales publicadas L0–L4. Esta etiqueta describe el flujo real de supervisión y no debe interpretarse como una definición normativa de la cátedra.

**Razón:** alinear literalidad del contrato con la decisión operativa, sin convertirla en norma oficial ni cambiar comportamiento autorizado.

**Evidencia:** [informe Fase 7](../Informe-Fase7.txt), [informe Fase 8](../Informe-Fase8.txt), prompts efectivos en snapshots académicos. La instrucción del usuario de Fase 8 autoriza expresamente esta sustitución.

**Hashes SHA-256 del archivo system prompt:**

- Anterior (iteración DSO y RRHH): `193203d4dc0f8f7c8aaeb9e1908e2c26985e08936ca2137b87d1fafb66a1b860`.
- Nuevo (Fase 8): `2c84b8a045dd8951ba62faec0eb31f5e22718d345d8c2cb5badd76891b265a35`.
- SLA y DSO original conservan su versión más antigua: `35b8bf813106a2f44823f11caf7f526152617d043d8f87ec995ebd947bcf5d15`.

**Resultado/impacto:** comprobación byte a byte mediante sustitución inversa confirma que no cambió otra instrucción. La versión combinada calculada por el agente cambiará al cargar el nuevo archivo; estos hashes de archivo no deben confundirse con `prompt_version` combinado. **Límite:** no se ejecutaron Gemini/Tavily ni corridas con esta versión; no se le atribuyen resultados anteriores. Snapshots, hashes históricos, manifests, scoring, herramientas, outputs, SQLite y arquitectura no cambiaron.

### D26 — Mantener fuera del Trabajo Final funciones de expansión

**Fecha/fase:** definición conceptual/Segunda Misión; ratificada en Fases 7–8. **Estado:** excluidas del alcance actual, no implementadas.

**Contexto y alternativas:** visión amplia frente a construir todas las capacidades antes de demostrar funcionamiento y evidencia. No se descartó conceptualmente la evolución futura del producto.

**Decisión y razón:** dejar para roadmap flashcards, spaced repetition, simuladores, dashboard avanzado, autenticación completa, multiusuario corporativo, multiagente y RAG/vector DB. Mantener un agente, búsqueda real e historial suficiente reduce alcance e infraestructura.

**Evidencia:** [historia anterior](../DECISIONES-antes-Fase8.md), [informe Segunda Misión](../Informe-Segunda-Mision-Metricamente.txt), [README](README.md).

**Resultado/impacto:** prioridad a aprendizaje utilizable, controles determinísticos, evidencia y reproducibilidad dentro del tamaño esperado. **Límite:** las fichas de estudio existentes no son repetición espaciada; la tabla básica no es dashboard avanzado. No se incorpora ahora ninguna función del roadmap.

## Balance de la auditoría y pendientes reales

La versión anterior mezclaba decisiones vigentes con frases históricas como «No se ejecutó Fase 6», «generación bloqueada por 404» y «L0–L4 pendiente». Aquí quedan situadas en su etapa, no borradas. El antecedente completo permanece en la copia citada al inicio.

La armonización de D25 resuelve la discrepancia literal vigente. Los documentos de Fase 7 y el índice académico conservado describen la versión que entonces era vigente; sus hashes históricos no deben interpretarse como hash del prompt Fase 8. No se modificó ningún archivo bajo corridas/ para actualizar esa terminología retrospectivamente.

Persisten: análisis económico final con usage real y condiciones fechadas; límites de autenticación/despliegue compartido; calidad semántica y evaluación humana de fuentes; carencia de un log independiente localizado para la prueba aislada Flash-Lite 2.5. No se simulan evidencias faltantes ni se ejecutan pruebas nuevas para llenarlas en esta fase.

Fase 8 no activa Fase 9, no habilita billing y no crea commit/push/PR/merge. Los errores y alternativas descartadas siguen siendo parte de la historia verificable.


### D27 — Valorar consumo real sin confundir gratuidad con costo equivalente

**Fecha/fase:** Fase 9, consolidación 13/09/2026; tarifas de referencia aprobadas al 12/09/2026. **Estado:** análisis completado, sin cambio de modelo o implementación.

**Contexto y alternativas:** la operación bajo free tier mostró USD 0 monetario observado, pero eso no permite estudiar sostenibilidad ni afirmar gratuidad permanente. Se aprobó valorar el mismo consumo a Gemini Standard (USD 0.30 input / USD 2.50 output por millón) y Tavily PAYG (USD 0.008/crédito). No se consultaron proveedores ni precios nuevos en esta fase.

**Decisión y razón:** usar SLA, DSO original y RRHH como proxy de costo medio para la hipótesis 10 sesiones/semana, 520/año; separar la reanudación DSO como calibración. Mantener Gemini 3.5 Flash-Lite como el modelo de menor costo efectivamente validado en este proyecto, sin afirmar comparación universal ni que resuelva toda ambigüedad pedagógica.

**Evidencia:** [ECONOMIA.md](ECONOMIA.md) contiene fuentes oficiales aportadas, tarifas, archivos de usage y cálculo A–M; no se reemplaza ninguna evidencia histórica.

**Resultado/impacto:** tres corridas USD 0.0351520 equivalente; promedio USD 0.011717333…; escenario anual USD 6.093013333… y 28.89 créditos Tavily/mes medios. Iteración separada USD 0.0175029. USD 0 observado para las llamadas analizadas, según las condiciones confirmadas, no auditoría de facturas. El pendiente económico del balance anterior corresponde al cierre Fase 8; queda atendido por este análisis posterior.

**Límites:** precios variables; mezcla de recorridos y DSO fallida; no costo total de propiedad; cuotas Gemini no verificadas para garantizar volumen. No se valoró Fase 5 ni se inventó consumo faltante. No se reescribieron D01–D26, no se modificó el prompt ni se ejecutó Fase 10.


### D28 — Formalizar gobierno sin atribuir controles inexistentes

**Fecha/fase:** Fase 10, 13/09/2026. **Estado:** formalización documental completada; sin cambios funcionales.

**Contexto y alternativas:** los permisos y la supervisión estaban distribuidos entre código, contrato y corridas. Se consolidan en un documento específico para distinguir control técnico de responsabilidad humana, sin duplicar la guía de uso ni desarrollar mecanismos nuevos.

**Decisión y razón:** [GOBIERNO.md](GOBIERNO.md) fija al autor/operador humano como responsable final, recoge L2 como convención del proyecto (no estándar oficial UCEMA), acciones prohibidas y 14 riesgos específicos. Ante ausencia del responsable, PENDING REVIEW es regla operativa, no estado implementado; no se interpreta silencio como ACCEPT.

**Evidencia:** implementación y corridas enlazadas en GOBIERNO: SLA ACCEPT sin repaso, ambas DSO detenidas antes de score, RRHH ACCEPT sin iniciar módulos.

**Resultado/impacto:** se documentan códigos reales de error (no existe tool_error genérico), límite de reintento estructural y ausencia de recuperación garantizada de trazas bajo fallo SQLite. No hay acceso SQL/archivos/billing/Git del agente; aceptar por endpoint sólo registra, mientras un clic humano puede aceptar e iniciar actividad.

**Límites:** UUID no autentica, no hay cola/bloqueo técnico de revisión ni firma digital humana; pueden existir runs completos sin artefacto persistido si falla la inserción posterior. Cuota/billing se describen como ramas previstas, no validación externa observada. El prototipo académico no se presenta como producto multiusuario público ni con SLA de producción. D01–D27, prompts y evidencia siguen intactos; no se ejecutó Fase 11.
