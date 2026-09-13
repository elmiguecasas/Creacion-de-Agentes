# Metricamente

Metricamente es una plataforma/tutor agéntico para aprender métricas, indicadores y sistemas de medición aplicados a organizaciones, procesos y distintas áreas de actividad. Ayuda a comprender definiciones, fórmulas, ejemplos y errores frecuentes, practicar y decidir qué estudiar a continuación a partir del historial real.

El problema que aborda es la fragmentación del aprendizaje entre áreas y fuentes, con poco vínculo entre contenido, práctica y progreso. No se limita a Operaciones ni a KPIs: las cinco métricas originales —Throughput, Lead Time, Cycle Time, Backlog y SLA— son seeds históricos de continuidad, no un catálogo cerrado.

## Estado y alcance del Trabajo Final

Fase 5 técnicamente READY y Fase 6 COMPLETE: existen tres corridas académicas reales, distintas y reconstruibles. SLA es PASS; DSO conserva un fallo pedagógico detectado por supervisión; RRHH es PASS. La iteración DSO se conserva por separado. La documentación principal se consolidó en Fase 7; Fase 8 auditó DECISIONES.md y armonizó únicamente la instrucción L2 del prompt. También se completaron el análisis económico (Fase 9), gobierno y riesgo (Fase 10), la auditoría integral (Fase 11) y la auditoría adversarial (Fase 12).

La implementación usa **un único agente, Gemini 3.5 Flash-Lite (`gemini-3.5-flash-lite`), Tavily y SQLite**, con validación estructural y scoring por código. Ver [índice de corridas](corridas/README.md), [informe técnico de Fase 5](../Informe-Fase5-Gemini.txt) e [informe final de Fase 6](../Informe-Fase6-Final.txt). Los informes anteriores BLOCKED son antecedentes; el informe final consolida su cierre.

El alcance es una evolución utilizable del MVP, menor que un producto completo. No se afirma que todas las métricas posibles estén cubiertas ni que toda generación sea correcta.

| Entrega 1 | Trabajo Final implementado |
|---|---|
| Frontend HTML/CSS/JS y cinco métricas | Frontend conservado y entrada abierta por concepto o dominio |
| Contenido y banco de preguntas hardcoded | Seeds más módulos, rutas y quizzes generados con fuentes |
| Score local | Cálculo compartido y score oficial del servidor |
| Resumen en localStorage | Historial de intentos en SQLite; UUID local de asociación |
| Sin modelo/API/herramientas | Gemini, progreso read-only y búsqueda Tavily |
| Feedback del banco | Explicación por pregunta más feedback adaptativo del agente |
| Sin trazas agénticas | JSON Schema/AJV, decisiones humanas y evidencia reconstruible |

### Implementado y roadmap

**Implementado:** input abierto, métrica específica, ruta por área, búsqueda externa, módulos con fichas de estudio, quizzes de cinco preguntas, scoring, feedback, tabla básica de progreso, persistencia y registro de decisiones humanas.

**Roadmap / no implementado:** flashcards como sistema de tarjetas de recuperación, repetición espaciada, simuladores, dashboard avanzado, autenticación completa, multiusuario corporativo, recuperación de cuenta, sincronización de identidad entre dispositivos y multiagente. Las fichas expositivas actuales no equivalen a un sistema de repetición espaciada. No es un LMS completo.

## Arquitectura y flujo

```text
Frontend HTML/CSS/JS
  → Node.js / Express
    → agente Gemini 3.5 Flash-Lite (generateContent)
      → get_learning_progress → SQLite (lectura)
      → search_metric_sources → Tavily (módulo/ruta)
      → salida JSON Schema → AJV + validaciones semánticas
    → persistencia de artefactos y trazas
    → quiz congelado → respuestas humanas → scoring oficial por código
    → feedback sobre intento persistido → decisión humana
```

El diagrama muestra responsabilidades; no todas las operaciones usan búsqueda ni scoring. Gemini no calcula el score oficial, no recibe API keys como contenido del prompt y no tiene SQL arbitrario. Las credenciales se usan exclusivamente en el servidor para autenticar solicitudes a los proveedores correspondientes.

### Modos y operaciones

| Modo conceptual | Valor real en código/API | Recorrido |
|---|---|---|
| `specific_metric` | `metric` | Intención → interpretación → progreso → búsqueda → módulo → estudio → quiz → intento → feedback |
| `learning_route` | `area` | Intención → interpretación → progreso → búsqueda → ruta ordenada → elección humana |
| Necesidad de aclaración | `clarify` | Solicitar contexto antes de preparar contenido |

`specific_metric` y `learning_route` son nombres conceptuales de esta documentación, no valores nuevos del schema. Ejemplos de entrada: «Quiero aprender CAC» y «Quiero aprender métricas de Recursos Humanos». Los seeds también pueden abrirse directamente desde el catálogo, sin generar un módulo nuevo.

Una ruta no crea ni completa por sí misma los módulos propuestos. El historial consultado es real; si no existen intentos, el agente recibe esa ausencia en lugar de progreso ficticio.

## Contrato del agente y validación

[System prompt](prompts/system_prompt.md) y [user prompt](prompts/user_prompt.md) contienen las seis piezas: **Rol, Contexto, Tarea, Restricciones, Formato y Ejemplos**. El system prompt define el tutor y sus límites; la plantilla de usuario incorpora los datos delimitados de cada operación mediante `{{request_json}}`.

El contrato exige respetar identidad, artefactos/versiones, fuentes e historial; no cambiar scores; y dejar la elección al usuario. Incluye reglas generales de consistencia entre definición, fórmula, ejemplo y quiz, y de una sola respuesta correcta por pregunta. Esas instrucciones reducen riesgos, pero no garantizan cumplimiento pedagógico: DSO lo demuestra.

Las operaciones `interpret`, `module`, `route`, `quiz` y `feedback` tienen schemas en [schemas/](schemas/). Gemini produce un sobre `status/data/reason` mediante `responseMimeType: application/json` y `responseJsonSchema`. AJV valida el resultado completo y el código verifica referencias, IDs y restricciones adicionales. Una salida estructuralmente inválida puede recibir un único reintento; evidencia insuficiente devuelve `insufficient_sources`. No se transforma un fallo en éxito silenciosamente.

La versión del contrato se calcula con SHA-256 del system prompt, plantilla de usuario y schemas serializados. Las trazas preservan solicitudes, prompts y schemas efectivos. SLA y DSO original usaron una versión anterior a la regla general de convenciones; RRHH y la reanudación DSO usaron la versión posterior. No deben sustituirse los prompts de los snapshots por los actuales al reconstruir.

**Armonización posterior en Fase 8:** se sustituyó únicamente la instrucción que impedía asignar una etiqueta L0–L4 por la adopción explícita de L2 como convención del proyecto, no definición normativa de la cátedra. [DECISIONES, D25](DECISIONES.md#d25--armonizar-l2-después-de-las-corridas) conserva texto anterior/nuevo y hashes. No se reejecutaron corridas: sus snapshots mantienen los prompts anteriores y no acreditan inferencia con la versión Fase 8.

## Herramientas y proveedores reales

- **Gemini:** SDK `@google/genai`, modelo configurado `gemini-3.5-flash-lite`, API `models.generateContent`. Interpreta, solicita herramientas y genera salidas; no se usa Interactions API.
- **`get_learning_progress`:** function calling real, validación de identidad y filtros, consulta read-only a agregados e historial en SQLite. El modelo recibe la respuesta de la herramienta y no acceso directo a la base.
- **`search_metric_sources`:** function calling real para módulo/ruta; el servidor ejecuta HTTP contra Tavily. Búsqueda `basic`, máximo cinco resultados, `auto_parameters` desactivado, uso solicitado, sin reintento de búsqueda. La consulta procede del agente; sus límites los fija el servidor.

Tavily devuelve query, resultados con título/URL/content y, cuando existen, score, response_time y usage. Se conservan respuesta real, timestamps y fuentes seleccionadas. El modelo recibe datos normalizados. Las referencias generadas deben corresponder a URLs recuperadas con contenido, con al menos una fuente clasificada tier 1 o 2. Esa clasificación de autoridad no es una certificación independiente: requiere evaluación semántica y humana.

Cada operación agéntica consulta progreso; módulo y ruta añaden búsqueda. El quiz utiliza el módulo y referencias guardadas. El feedback recibe el intento oficial desde SQLite. Timeout de 60 segundos por petición externa; el SDK tiene `retryOptions.attempts=1`. Hay exclusión de solicitudes agénticas simultáneas por UUID dentro del proceso, no un presupuesto monetario global.

Errores Tavily 402 se clasifican como pago requerido; 429/432/433 como cuota; otros fallos se reportan explícitamente. No se habilita billing ni se cambia de proveedor automáticamente. Los éxitos previos y créditos reportados no certifican condiciones futuras de cuenta o gratuidad.

## Quizzes, scoring y feedback

Los seeds contienen seis preguntas por métrica; el selector toma cinco, procura incorporar una no vista en el último quiz y mezcla preguntas/opciones manteniendo la clave. Para módulos nuevos el agente genera cinco preguntas; se aporta el quiz anterior para variar y se rechaza la repetición exacta del conjunto de preguntas. No se garantiza diversidad semántica ilimitada.

El quiz se congela con ID, versión, orden de preguntas/opciones, clave y explicaciones antes de responder. [shared/scoring.js](shared/scoring.js) requiere cinco respuestas con índices enteros de 0 a 3 y compara cada una con `correct_option`:

```text
correct_count = número de respuestas correctas
score = round(correct_count / 5 × 100)
```

Cada acierto vale 20 puntos. Los niveles son Inicial (<50), En progreso (50–74) y Dominado (≥75); con cinco preguntas, el primer score posible de Dominado es 80. El servidor es la autoridad y no acepta el score propuesto por el cliente.

Reenviar las mismas respuestas del mismo quiz devuelve el mismo intento; respuestas distintas después de guardarlo producen 409. Otro intento requiere otro quiz. Se conservan respuestas incorrectas, clave y resultado por pregunta. La revisión inmediata muestra la explicación congelada; luego Gemini genera fortalezas, aspectos a reforzar y recomendación sobre ese intento. Si falla el feedback, el intento ya guardado sigue siendo válido.

Las claves correctas llegan al navegador para el cálculo compartido. Es una herramienta de autoaprendizaje, no un examen protegido contra consulta de respuestas.

## Persistencia e identidad

| Tabla | Información conservada |
|---|---|
| `users` | Identificador y fecha de creación |
| `modules` | ID/version, usuario (nulo para seeds), área, métrica, contenido, fuentes, run y fecha |
| `quizzes` | ID, módulo/version, usuario, versión, quiz completo, run y fecha |
| `attempts` | ID, usuario, quiz, respuestas, resultados por pregunta, score, aciertos y fecha |
| `agent_runs` | ID, usuario, operación, modelo, versión del prompt, entrada, tool calls, salida, estado, error y fecha |
| `routes` | ID, usuario, ruta completa, run y fecha |
| `decisions` | ID, usuario, run, accept/reject y fecha |

SQLite y sus triggers impiden UPDATE/DELETE de módulos, quizzes, intentos, rutas y decisiones. Un run pasa de `running` a terminal una vez. Un administrador del archivo podría alterar la base o sus restricciones: no es almacenamiento criptográficamente inviolable. Los manifiestos permiten verificar artefactos exportados, no prueban por sí solos su procedencia externa.

El progreso se deriva de intentos: área/métrica, cantidad, último score, mejor score e historial vinculado al quiz congelado. No se convierte aceptar una ruta en progreso completado.

`localStorage['metricamente-user-id']` conserva el UUID del navegador. El resumen legado `metricamente-operaciones-v1` permanece separado, sin inventar intentos históricos. Borrar localStorage pierde la asociación local, no borra SQLite. No hay recuperación automática ni sincronización de UUID entre dispositivos.

## Supervisión: L2 — Autonomía supervisada

**L2 es una convención operativa adoptada por el proyecto ante ausencia de definiciones oficiales publicadas L0–L4.** No se presenta como clasificación oficial de la consigna.

El agente interpreta, consulta, busca, genera, analiza y recomienda. El humano inicia, responde, revisa, acepta/rechaza y decide el siguiente paso. La revisión pedagógica de las corridas fue una supervisión humana del proceso; no existe un mecanismo que garantice que todo módulo generado haya sido aprobado pedagógicamente antes de mostrarse.

El endpoint de decisiones registra ACCEPT/REJECT y no inicia actividades. En la interfaz, un clic explícito en «Repasar fichas», «Intentar otro quiz» o «Estudiar este concepto» registra aceptación y ejecuta la actividad elegida. Por tanto, no hay avance autónomo del agente, pero sí botones que combinan decisión y acción humana. En las corridas se registraron decisiones por endpoint sin iniciar actividades adicionales:

- **SLA:** ACCEPT explícito después del score 60 y feedback; no se inició repaso.
- **DSO:** la revisión detectó contradicciones y detuvo el flujo antes de producir intento o score.
- **RRHH:** ACCEPT autorizado y registrado después de revisar la ruta; no se crearon módulos, quizzes ni intentos.

## Estructura del proyecto

| Ruta | Responsabilidad |
|---|---|
| `index.html`, `styles.css`, `app.js` | Interfaz, estudio, quiz, resultados, ruta y tabla básica de progreso |
| `server/index.js`, `server/app.js` | Arranque Express, endpoints y entrega de archivos públicos |
| `server/agent.js` | Orquestación acotada Gemini, herramientas, Tavily y trazas |
| `server/database.js`, `server/store.js` | SQLite, restricciones, historial y snapshots |
| `server/quizzes.js`, `shared/scoring.js` | Preparación del quiz y corrección determinística |
| `server/validation.js`, `server/errors.js` | AJV, reglas adicionales y errores |
| `data/seeds.json` | Cinco módulos y 30 preguntas históricos |
| `prompts/`, `schemas/` | Contrato de seis piezas y estructuras por operación |
| `scripts/`, `tests/` | Exportación, smoke real y pruebas locales con fixtures |
| `corridas/` | Índice y evidencia académica preservada |
| `DECISIONES.md` | Registro histórico auditado y consolidado en Fase 8 |
| `README.txt` | Antecedente de Entrega 1, conservado |
| `.env.example`, `package.json`, `package-lock.json` | Configuración de ejemplo y dependencias reproducibles |

La estructura obligatoria existe: este README, ambos prompts, corridas y [DECISIONES.md](DECISIONES.md), consolidado en Fase 8. La carpeta excluida de Entrega 2 no se utiliza como fuente ni componente.

## Instalación y ejecución

Requiere **Node.js ≥22** y npm, según `package.json` (proyecto versión 0.2.0, módulos ES). La evidencia previa acredita Node.js 24.19.0. `better-sqlite3` tiene componente nativo: instalar con una versión de Node compatible con la ejecución. Dependencias declaradas: Express, better-sqlite3, dotenv, @google/genai y AJV; el lockfile fija la resolución.

Desde la carpeta que contiene este README y `package.json`:

```sh
npm ci
```

Crear `.env` a partir de [.env.example](.env.example) **sólo si todavía no existe**. En PowerShell:

```powershell
if (-not (Test-Path -LiteralPath .env)) { Copy-Item -LiteralPath .env.example -Destination .env }
```

Completar las credenciales localmente, sin publicarlas. El ejemplo no contiene claves:

```dotenv
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.5-flash-lite
TAVILY_API_KEY=
DATABASE_PATH=./db/metricamente.db
PORT=3000
HOST=127.0.0.1
```

| Variable | Uso |
|---|---|
| `GEMINI_API_KEY` | Autenticación servidor → Gemini |
| `GEMINI_MODEL` | Modelo; predeterminado `gemini-3.5-flash-lite` |
| `TAVILY_API_KEY` | Autenticación servidor → Tavily para módulo/ruta |
| `DATABASE_PATH` | Archivo SQLite; usar la base correspondiente al usuario/evidencia |
| `PORT`, `HOST` | Puerto y dirección; valores predeterminados 3000 y loopback |

```sh
npm start
```

Abrir `http://127.0.0.1:3000`. El arranque crea la base y seeds si corresponde. Detener con Ctrl+C. Sin credenciales se pueden estudiar los seeds y guardar sus intentos; las operaciones que requieren IA/búsqueda fallan explícitamente. `/api/health` informa estado local y presencia de configuración Gemini: no comprueba acceso real, Tavily ni cuota.

No habilitar billing como parte de estas instrucciones. Configurar credenciales no garantiza cuota ni disponibilidad. No copiar una base privada o `.env` al entregable.

### Uso cotidiano

1. Abrir un seed o escribir una intención y elegir concepto/ruta por área.
2. Revisar contenido y fuentes. En una ruta, elegir explícitamente el concepto a estudiar.
3. Completar cinco respuestas para registrar un intento oficial.
4. Revisar corrección, explicación y feedback; elegir el siguiente paso.
5. Consultar la tabla Área / Métrica / Intentos / Último score / Mejor score.

### Endpoints

Los endpoints de datos usan `X-User-Id` con UUID. Si se envía `user_id` en el cuerpo, debe coincidir. Este vínculo no es autenticación: conocer el UUID permite suplantar ese perfil.

| Método/ruta | Entrada principal / resultado |
|---|---|
| `GET /api/health` | Estado local de configuración |
| `GET /api/modules` | Seeds y módulos del usuario |
| `POST /api/learning/interpret` | intent, mode opcional → interpretación |
| `POST /api/learning/module` | intent, area opcional → módulo |
| `POST /api/learning/route` | intent → ruta |
| `POST /api/learning/quiz` | module_id, version → quiz congelado |
| `POST /api/attempts` | quiz_id, answers[5] → resultado oficial |
| `POST /api/learning/feedback` | attempt_id → recomendación |
| `GET /api/progress/:userId` | filtros area/metric opcionales → progreso |
| `POST /api/decisions` | run_id, decision accept/reject → registro |

## Corridas y reconstrucción

El [índice de evidencia](corridas/README.md) localiza inputs, outputs, herramientas, fuentes, usage, decisiones y manifiestos. Permite seguir IDs y fechas sin depender de esta conversación. Los snapshots son exportaciones de estado, no una restauración automática de SQLite.

**Replay / reconstrucción:** inspeccionar exactamente lo guardado, verificar hashes y relaciones, y recalcular el score cuando exista intento. No llama a proveedores. **Rerun:** volver a ejecutar Gemini/Tavily; consume recursos y puede producir contenido distinto. Debe generar IDs nuevos y preservar el material anterior. No se promete determinismo del LLM ni de la búsqueda.

Para comprobar un archivo en PowerShell desde el proyecto:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath corridas/corrida-01-sla/input.json
```

Comparar con la entrada `file`/`sha256` de su `manifest.json` y repetir para cada archivo listado. DSO original incluye además `manifest-supplement.json`; verificar ambos. El manifiesto inicial no se incluye a sí mismo.

Para reconstruir el score SLA, leer `snapshot-final.json`, buscar el intento y su `quiz_id`, parsear `answers_json` y `quiz_json` si son cadenas, y aplicar `scoreQuiz(quiz, answers)` de [shared/scoring.js](shared/scoring.js). Comparar `score`, `correct_count` y `results` con los valores persistidos. Debe devolver 60/100 y tres aciertos. No hay scores DSO/RRHH que reconstruir.

### Comandos auxiliares existentes

```sh
npm test
npm run export:run -- <user-id>
npm run smoke:agent
```

- `npm test`: pruebas locales con SQLite y fixtures de proveedor. Los 21 tests pasaron tras la corrección pedagógica de Fase 6, antes de la armonización L2. No se repitieron en Fases 7–8; la nueva redacción no se presenta como probada mediante inferencia.
- `export:run`: exporta la evidencia del usuario de `DATABASE_PATH` a un JSON nuevo en `corridas/`, sin sobrescribir, y muestra SHA-256. Requiere usuario/base existentes; no invoca Gemini/Tavily. Puede incluir varias ejecuciones y catálogo seed contextual. No constituye por sí solo una nueva corrida ni restaura una base.
- `smoke:agent`: **prueba externa real**, requiere Gemini y Tavily para crear un módulo. Consume cuota y registra evidencia técnica; no ejecutarlo para una reconstrucción offline ni confundirlo con las tres corridas académicas.

## Seguridad, limitaciones y economía

El [marco de gobierno y riesgo de Fase 10](GOBIERNO.md) documenta permisos reales, 14 riesgos y respuestas, L2 y autoridad final del autor/operador humano. Sin responsable, una salida que requiere revisión queda PENDING REVIEW como regla operativa: no existe ese estado ni un bloqueo pedagógico automático en la aplicación. El documento distingue fallas observadas de controles previstos y limita el alcance a un prototipo académico funcional, sin autenticación completa ni SLA de producción.

`.env` existe localmente dentro de la carpeta del proyecto, está ignorado y no está versionado: no está literalmente fuera de esa carpeta. No debe entregarse. `.env.example` sólo incluye nombres, configuración no secreta y credenciales vacías. `.gitignore` excluye SQLite y JSON directamente bajo `corridas/`; **no excluye automáticamente los JSON en subcarpetas académicas**. Revisar expresamente esas evidencias antes de compartirlas.

El servidor entrega sólo archivos públicos permitidos y usa redacción de credenciales en trazas. Los inputs, progreso y contenidos enviados a Gemini/Tavily pueden tener implicancias de privacidad; los UUID técnicos no deben confundirse con anonimización completa. El servicio inicia en loopback. Una publicación compartida requiere autenticación, protección contra abuso y revisión de acceso; no se implementaron en este alcance.

Límites demostrados:

- JSON/AJV válido no garantiza exactitud ni consistencia pedagógica.
- DSO mezcló convenciones y preguntas contradictorias; el fallo permanece, sin score ni feedback inventados.
- Fuentes y snippets requieren evaluación. En RRHH, un snippet de Sage contenía una fórmula de rotación aparentemente problemática; la ruta no la reprodujo y se aceptó sin generar módulos.
- Gemini y Tavily no son determinísticos; disponibilidad, cuota y contenido externo pueden variar.
- UUID local no equivale a login, y la revisión humana no es una aprobación pedagógica automática del sistema.
- El catálogo seed no tiene fuentes externas reconstruidas artificialmente; se identifica su procedencia histórica.
- No es un LMS completo ni una evaluación resistente a consulta de claves.

Se conservan `usageMetadata` de Gemini y `usage`/créditos Tavily por separado, sólo con campos realmente recibidos. No se infiere costo cero ni plan gratuito a partir de una respuesta exitosa. El [análisis económico de Fase 9](ECONOMIA.md) valora usage preservado con las tarifas de referencia aprobadas del 12/09/2026. Las tres corridas suman USD 0 monetario observado y USD 0.0351520 equivalente Paid Standard/PAYG; promedio USD 0.011717333… por corrida. La hipótesis de 10 sesiones semanales (520/año) da USD 6.093013333… equivalente anual y 28.89 créditos Tavily/mes medios. La reanudación DSO se separa como calibración (USD 0.0175029 equivalente), fuera de esa proyección. El promedio combina recorridos diferentes y no es costo por aprendizaje aprobado. La compatibilidad con free tier es condicional: no se verificaron cuotas Gemini suficientes para garantizar ese volumen ni se promete gratuidad futura. La auditoría histórica de `DECISIONES.md` se completó en Fase 8. Los límites por petición acotan llamadas, pero no reemplazan un presupuesto ni gobierno de producción.

### Antecedentes de proveedores

OpenAI fue un proveedor inicial; Gemini 2.5 y Google Search Grounding aparecen en informes como alternativas históricas. **No son proveedores operativos actuales.** La integración vigente utiliza Gemini 3.5 Flash-Lite y búsqueda Tavily. Los informes y outputs históricos conservan sus nombres originales para no alterar evidencia.
