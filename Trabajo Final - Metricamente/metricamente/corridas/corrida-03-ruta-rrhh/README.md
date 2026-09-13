# Corrida 3 — Ruta RRHH

Estado PASS; academic_final_run. Input exacto: «Quiero aprender métricas de Recursos Humanos».

Interpretación de área → get_learning_progress SQLite → search_metric_sources/Tavily → evidencia → ruta estructurada validada por AJV → persistencia → revisión del operador → ACCEPT autorizado explícitamente por el usuario.

Ruta: rotación, costo por contratación, absentismo e ingresos por empleado. Se registró ACCEPT sin crear módulos dinámicos, quizzes o intentos. L2 es la convención de autonomía supervisada adoptada por el proyecto.

metadata.json relaciona run_ids y hashes de prompts; http-*.json conserva requests/resultados; tool_calls.json y sources.json preservan consultas, resultados exactos y fuentes seleccionadas; usage.json separa uso Gemini y Tavily; human_decision.json registra la decisión. snapshot-final.json reconstruye SQLite incluyendo el catálogo seed contextual. La revisión conserva una observación sobre un snippet externo, sin alterar el output ni exigir otra generación.

Verificar los SHA-256 de manifest.json. Reconstrucción/replay consiste en leer artefactos y relaciones guardadas. Un rerun implica nuevas solicitudes e IDs y no garantiza texto idéntico. No se reutilizó evidencia de Fase 5.
