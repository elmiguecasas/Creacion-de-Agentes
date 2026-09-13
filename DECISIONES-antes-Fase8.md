# Decisión vigente — cierre de integración Fase 5

El usuario aprobó Gemini 3.5 Flash-Lite + Tavily API + get_learning_progress. OpenAI fue el proveedor inicial; se migró a Gemini por costo. Gemini 2.5 Flash y Flash-Lite rechazaron inferencia para usuarios nuevos (404), aunque eran visibles. Gemini 3.5 Flash-Lite se validó con inferencia real. Google Search Grounding no satisfacía API Free Tier; Tavily respondió HTTP 200 con un crédito y fue adoptado tras autorización explícita.

server/agent.js integra search_metric_sources mediante function calling en una fase separada. La query es emitida por Gemini y validada por backend; el servidor fija basic, cinco resultados, auto_parameters false, include_usage true y timeout 60 s, sin retry. No usa Google Search ni Interactions API. No se añadió SDK ni se modificó SQLite, frontend, scoring, schemas o get_learning_progress.

El adaptador conserva respuesta nativa Tavily en la traza y devuelve al modelo un contrato estable de query/results/title/url/content/score/response_time/usage. Las URLs aceptadas deben proceder de resultados reales con contenido. La selección final de fuentes queda registrada. La clasificación de autoridad conserva supervisión humana; no se declara verificación automática de verdad. Sin evidencia suficiente se devuelve insufficient_sources.

Gemini usageMetadata y Tavily usage/credits permanecen separados; no se inventa cero para campos ausentes. La redacción cubre ambas claves y campos de credenciales. No se habilitó billing ni se certifica el plan Tavily a partir del consumo de créditos. Datos de pruebas: UUID técnico y contenido educativo, sin información empresarial confidencial ni datos personales sensibles.

Defecto pedagógico real: el primer quiz preguntó por un error y ofreció varios errores posibles. Cambio mínimo en system_prompt.md: revisar las cuatro alternativas y usar prácticas correctas como distractores de preguntas sobre errores. Se generó un segundo quiz con el mismo flujo; el original permanece inmutable y sin intento. El hash del prompt permite distinguir ambas ejecuciones. No se alteró validación determinística ni se añadió un segundo agente.

La llamada mínima de la herramienta de pruebas heredaba una configuración de thinking de 2.5 y recibió INVALID_ARGUMENT; se retiró esa configuración del script aislado, sin cambiar la aplicación. El retest mínimo respondió OK.

Resultados y referencias de runs: ../Informe-Fase5-Gemini.txt y ../Fase5-evidencia-Tavily. Son integration_test_NOT_academic, fuera de corridas/. No se ejecutó Fase 6 ni se creó commit/push/PR/merge. Las secciones siguientes son historia de implementación y no sustituyen esta decisión vigente.

---

# Decisiones de implementación — Segunda Misión

## Fase 5 — alcance registrado antes de ajustar referencias residuales
La migración aprobada sustituye exclusivamente OpenAI por Gemini API, gemini-2.5-flash configurable y Google Search Grounding con @google/genai. Se mantienen schemas, AJV, scoring, persistencia, frontend y contrato de progreso.
Bloqueo menor detectado: server/app.js y scripts/smoke-agent.js verifican OPENAI_API_KEY fuera del adaptador. Sin ajustar esas referencias, health y el smoke no reconocerían Gemini. Se cambiará health para consultar el estado configurado del agente y el smoke para verificar GEMINI_API_KEY, sin alterar endpoints ni semántica. No se introduce otra arquitectura.

### Resultado de la migración de proveedor (Fase 5)
@google/genai 2.22.0 sustituye openai. Modelo inicial gemini-2.5-flash mediante GEMINI_MODEL. Solo GEMINI_API_KEY del servidor. No se mantiene un segundo provider activo. Las decisiones de Segunda Misión debajo de esta sección se conservan como historia; esta sección reemplaza exclusivamente su elección de proveedor.

models.generateContent usa functionDeclarations + modo ANY para progreso, googleSearch en una fase posterior y responseMimeType/responseJsonSchema para el resultado. Se conservan los cinco schemas completos y AJV sin modificaciones. Sin error real de Gemini no se decidió ninguna simplificación de schemas. La fase de búsqueda exige URIs de groundingChunks; no acepta URLs del texto libre. Se preservan respuestas completas, groundingMetadata y usageMetadata cuando existen.

Los controles de read-only y user_id se mantienen. Los argumentos se reciben como objetos functionCall.args; la respuesta SQLite vuelve como functionResponse. El contexto conserva las partes de respuesta del modelo, incluidas firmas devueltas. La normalización de metadata queda dentro de server/agent.js. No se cambia el esquema de SQLite.

retryOptions.attempts=1 evita retries de transporte/cuota; se conserva el único retry estructural. Gemini decide las consultas internas de Google Search: no se traslada artificialmente el antiguo límite OpenAI max_tool_calls. El adaptador rechaza pago requerido y cuota agotada, sin habilitar billing ni sustituir modelo. Una respuesta incompleta o bloqueada no se declara exitosa.

Gobierno: las condiciones de Gemini free tier pueden tratar los datos de forma distinta de paid tier. No usar información empresarial confidencial ni datos personales sensibles. Para tests, únicamente UUID técnico y contenido académico. Se preserva la metadata real, nunca una API key: redacción antes de logs y snapshots, sin headers de autorización. No se ejecutan corridas finales en Fase 5.

Verificación previa a la configuración de la clave (antecedente): 21 pruebas automáticas PASS; cuatro escenarios de navegador PASS / 0 pageerror; startup PASS. No hubo error real de schema Gemini porque falta la clave. El testing externo V1–V11 está bloqueado por GEMINI_API_KEY ausente y confirmación pendiente del proyecto free tier; no se atribuye éxito real a fixtures. No se activó facturación ni se observaron cuotas reales.

Fuentes oficiales consultadas 2026-09-12: https://ai.google.dev/gemini-api/docs/pricing y https://ai.google.dev/gemini-api/terms (condiciones/free tier); https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash (capacidades); documentación oficial @google/genai de GenerateContentConfig (responseJsonSchema). La disponibilidad documentada no prueba acceso de una cuenta concreta.

### Reanudación real — 12/09/2026
El usuario configuró la clave solo en .env y confirmó Nivel gratuito sin billing. models.get respondió, pero cinco solicitudes generateContent reales (mínima, grounding, structured output, módulo y ruta) devolvieron 404 NOT_FOUND indicando que gemini-2.5-flash no está disponible para usuarios nuevos. Esto reemplaza el bloqueo anterior por credencial ausente.

No se identifica el error como paid tier requerido ni como incompatibilidad de schema. No se modificó código, modelo, API, facturación ni arquitectura. La sugerencia de otro modelo/API en el error no constituye autorización. La elección de modelo disponible debe volver a Chat.

Se conservaron dos runs fallidos reales, snapshots y errores redactados en ../Fase5-evidencia-real, con SHA-256 y etiqueta integration_test_NOT_academic. Cero módulos generados, intentos o rutas; no hay grounding ni usageMetadata recibidos. Function calling y pedagogía permanecen bloqueados. Regresión repetida: 21 PASS, navegador 4 PASS/0 pageerror, startup PASS/configurado true y diff-check PASS. Fase 6 BLOCKED y no ejecutada. No se copió la clave a evidencia ni se crearon commits.

## Alcance
Se implementó la especificación aportada para Fases 2 y 3 sobre el commit 378c88ef70ee5828a19abaf15a19a2a87662220d. La carpeta excluida no se materializó en el checkout y no se consultó. README.txt se conserva.

## Stack
HTML/CSS/JS sin framework; Node.js/Express; better-sqlite3; OpenAI Responses con gpt-5.6-luna configurable; AJV; dotenv. Sin ORM, orquestador de agentes, vector DB ni Docker. Se usó Node 24.19.0 disponible en el entorno porque el Node por defecto era 18.14.2; no se cambió la arquitectura ni se instaló un runtime global.

## Autoridad del score
La función determinística es compartida con el frontend. El servidor recalcula contra el quiz persistido; ignora cualquier score externo. El resultado solo se presenta como guardado tras respuesta de persistencia. Cada quiz presentado admite un intento; repetir el mismo envío es idempotente y un reintento crea otro quiz.

## Falla real de Entrega 1: sesgo de ubicación
26 de 30 preguntas tenían correcta la opción inicial. Se conserva el significado de las respuestas y se mezclan opciones con Fisher–Yates y crypto.randomInt. Se recalcula la posición correcta y se persiste antes de responder al navegador. No se cambia la clave después. También se mezcla el orden de preguntas. Los tests comprueban que la opción correcta textual sobrevive a la permutación.

## Reintentos
El banco seed tiene seis preguntas: se priorizan las no presentes en el último quiz, por lo que al menos una cambia y cuatro pueden repetirse. No se promete contenido totalmente nuevo para ese banco. Para módulos generados se entrega el último quiz al agente, se pide variación y se rechaza repetir el conjunto completo de enunciados. No se intenta demostrar equivalencia semántica de paráfrasis por código.

## Inmutabilidad y trazabilidad
Módulos/versiones, quizzes, intentos, rutas y decisiones son append-only con triggers. Los runs nacen running y finalizan una vez; si el proceso se interrumpe antes de finalizar, no se declara éxito. Los inputs incluyen prompts completos, hash SHA-256 y schema. tool_calls_json conserva requests/responses por fase y salida real del servicio de progreso; se copia cada request antes de extender el contexto para no alterar retrospectivamente la evidencia.

El quiz generado es un artefacto del run. La instancia presentada recibe un ID propio después de mezclar y queda vinculada al run. Esto permite conservar tanto el output original como lo efectivamente mostrado sin editar el primero. modules y quizzes se unen por módulo/version explícitos.

## Identidad y legacy
UUID local sin login, según aprobación. El backend vincula la herramienta al mismo UUID y rechaza IDs ajenos a esa petición, pero no existe autenticación criptográfica: conocer otro UUID permitiría suplantarlo. Se mantiene el alcance de aprendizaje ligero/local. El storage antiguo queda separado, sin migración ficticia.

## Fuente externa y contrato
Un solo agente; progreso mediante function calling real despachado al servicio de lectura; Web Search alojado; generación con JSON Schema y AJV. Módulo/ruta requieren búsqueda; quiz reutiliza el módulo fundamentado. No hay fallback silencioso si falla búsqueda. Estado insufficient_sources cuando no hay URLs recuperadas suficientes o válidas.

La autoridad de fuentes se juzga por el modelo bajo la política aprobada; el código verifica trazabilidad, no verdad semántica. No se introdujo un catálogo cerrado de dominios de fuentes. El contenido seed no tenía fuentes, y sigue señalado como tal; no se inventaron referencias retrospectivas.

## Ajustes menores, sin alternativa arquitectónica
Se añadieron interpret.schema.json y tablas routes/decisions para persistir interpretación estructurada, propuestas y supervisión. La API suma health/modules/decisions para interfaz y verificación. Se añadió module_version y user_id a quizzes y user_id a módulos para reconstrucción y separación. No se incorporaron dependencias de producto adicionales a las cinco aprobadas.

## Incidencias durante desarrollo
- Error de sintaxis en declaración de herramienta y en helper de pruebas: corregidos; importación y suite pasan.
- INSERT de agent_runs con un placeholder extra: los tests detectaron database_error; corregido y tests de logs pasan.
- Referencia mutable a mensajes en log: detectada al revisar, se usa structuredClone; test asegura snapshot exacto del request inicial.
- Playwright no tenía Chromium descargado: se utilizó Chrome instalado en modo headless, sin nueva dependencia del producto.

## Pendientes explícitos
Estado histórico de Segunda Misión: no había API key disponible. Estado actual: clave configurada, generación bloqueada por 404 del modelo; calidad generada y búsqueda efectiva siguen pendientes. No se fabricaron tres corridas ni costos. Etiqueta L0–L4 pendiente. La etapa siguiente debe revisar código vs contrato y rubricar corridas reales; esta implementación no declara aprobación académica.

## Fase 6 — corrección pedagógica focalizada autorizada
La DSO académica original se conserva íntegra en corrida-02-dso: mezcló ventas netas a crédito e ingresos netos sin condiciones; el quiz aceptó y penalizó esa sustitución. El usuario autorizó únicamente una regla general adicional en system_prompt.md para escoger una convención principal y mantenerla consistente en fórmula, ejemplo, quiz y explicación, explicitando supuestos o proxies alternativos. No se añadió una regla específica DSO ni se cambiaron schemas, tools, código o scoring. La reanudación usa carpeta e IDs nuevos; SLA no se repite. Los hashes de prompts distinguen el antes y después.
