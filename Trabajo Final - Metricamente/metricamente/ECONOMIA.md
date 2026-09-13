# Análisis económico de Metricamente — Fase 9

## A. Estado y alcance

**PASS — FASE 9 COMPLETE.** Análisis documental y cálculo offline sobre usage preservado, sin ejecutar Gemini/Tavily ni generar corridas. Fecha de referencia económica solicitada: **2026-09-12**. Consolidación de este documento: **2026-09-13**. No se realizó una nueva consulta de precios: se utilizan las tarifas oficiales aportadas y aprobadas en la misión, referidas al 12/09/2026. Los precios y condiciones pueden cambiar.

Se distinguen dos magnitudes:

- **Costo monetario observado de las llamadas analizadas: USD 0.** Según las condiciones confirmadas por el usuario y los informes de desarrollo, billing no fue habilitado, Gemini se utilizó bajo Free Tier y Tavily dentro de créditos disponibles; no se observaron cargos. No se accedió a facturas ni se auditó una cuenta de facturación en esta fase. Usage mide consumo, no certifica por sí solo el cobro.
- **Costo económico equivalente:** valoración del mismo consumo a tarifas Paid Tier Standard de Gemini y Pay As You Go de Tavily. Es una referencia de sostenibilidad, no una factura, un gasto efectivamente incurrido ni el costo total de operar el producto.

No se afirma que Metricamente siempre cueste USD 0.

## B. Pricing utilizado

| Proveedor / modalidad | Tarifa de referencia | Fuente oficial aportada | Fecha de referencia |
|---|---|---|---|
| Gemini 3.5 Flash-Lite — Free Tier | Input/output free of charge | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) | 2026-09-12 |
| Gemini 3.5 Flash-Lite — Paid Standard | Input USD 0.30 / millón de tokens | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) | 2026-09-12 |
| Gemini 3.5 Flash-Lite — Paid Standard | Output USD 2.50 / millón, incluyendo thinking cuando exista | [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) | 2026-09-12 |
| Tavily Researcher | Free, 1,000 créditos/mes, sin tarjeta requerida | [Tavily pricing](https://www.tavily.com/pricing) | 2026-09-12 |
| Tavily Pay As You Go | USD 0.008 / crédito | [Tavily pricing](https://www.tavily.com/pricing) | 2026-09-12 |
| Tavily Search basic | 1 crédito / búsqueda | [Basic vs advanced search](https://help.tavily.com/articles/6938147944-basic-vs-advanced-search-what-s-the-difference) | 2026-09-12 |

Modelo operativo: `gemini-3.5-flash-lite`. La búsqueda operativa es Tavily; **no se añade costo Google Search Grounding**. No se supone una migración de plan ni se habilita billing. Las referencias son las de la misión, no una verificación web nueva fechada artificialmente el día anterior.

## C. Usage real contrastado

Se sumaron los campos de cada respuesta Gemini y los créditos realmente reportados por Tavily en estos artefactos:

| Ejecución | Input: promptTokenCount | Output: candidatesTokenCount | totalTokenCount | Búsquedas basic / créditos | Evidencia |
|---|---:|---:|---:|---:|---|
| SLA | 9425 | 473 | 9898 | 0 / 0 | [usage SLA](corridas/corrida-01-sla/usage.json) |
| DSO original | 14496 | 2166 | 16662 | 1 / 1 | [usage por proveedor DSO](corridas/corrida-02-dso/usage-by-provider.json) |
| RRHH | 10519 | 889 | 11408 | 1 / 1 | [usage RRHH](corridas/corrida-03-ruta-rrhh/usage.json) |
| **Suma principal** | **34440** | **3528** | **37968** | **2 / 2** | Tres corridas académicas |
| DSO reanudación, separada | 15468 | 1945 | 17413 | 1 / 1 | [usage iteración](corridas/corrida-02-dso-reanudacion/usage.json) |

Los valores coinciden con la misión y el [informe final Fase 6](../Informe-Fase6-Final.txt). Para DSO se usa el índice corregido por proveedor, junto con su [nota del extractor](corridas/corrida-02-dso/evidence-note.md); no se modifica el usage original ni se cuenta una fila Tavily como Gemini.

SLA no ejecutó búsquedas: su cero corresponde a ausencia comprobada de esas llamadas, no a reemplazar un campo ausente. Las respuestas Gemini contienen promptTokenCount, candidatesTokenCount, totalTokenCount, promptTokensDetails y serviceTier. No se recibieron thoughtsTokenCount ni toolUsePromptTokenCount en esta muestra y no se inventan valores para ellos. Input + candidates coincide con total en las cuatro ejecuciones. Se aplica la fórmula aprobada a los campos recibidos, sin agregar thinking supuesto ni usar totalTokenCount con una tarifa única. Si una futura respuesta informa thinking facturable separado, deberá incorporarse sin duplicarlo.

## D. Costo equivalente por corrida

Todas las cantidades son USD. Tarifas distintas para input y output:

```text
Gemini_input  = promptTokenCount / 1,000,000 × 0.30
Gemini_output = candidatesTokenCount / 1,000,000 × 2.50
Gemini        = Gemini_input + Gemini_output
Tavily        = créditos × 0.008
Total         = Gemini + Tavily
```

Para evitar redondeo temprano se calculó en unidades de USD 0.0000001: input cuesta 3 unidades/token, output 25 unidades/token y Tavily 80000 unidades/crédito. Los costos individuales y la suma son exactos con estas tarifas. Promedios/proyecciones periódicos se redondean sólo al mostrarlos.

| Corrida | Input tokens | Output tokens | Gemini equiv. USD | Tavily credits | Tavily equiv. USD | Costo equivalente total USD | Costo monetario observado USD |
|---|---:|---:|---:|---:|---:|---:|---:|
| SLA | 9425 | 473 | 0.0040100 | 0 | 0.0000000 | **0.0040100** | 0 |
| DSO original | 14496 | 2166 | 0.0097638 | 1 | 0.0080000 | **0.0177638** | 0 |
| RRHH | 10519 | 889 | 0.0053782 | 1 | 0.0080000 | **0.0133782** | 0 |
| **Suma** | **34440** | **3528** | **0.0191520** | **2** | **0.0160000** | **0.0351520** | **0** |
| **Promedio por corrida** | **11480** | **1176** | **0.0063840** | **0.666667** | **0.005333333…** | **0.011717333…** | **0** |

Desglose completo:

- SLA: 9425 / 1M × 0.30 = **0.0028275 input**; 473 / 1M × 2.50 = **0.0011825 output**; suma Gemini = 0.0040100; sin búsqueda → total **0.0040100**.
- DSO original: 14496 / 1M × 0.30 = **0.0043488 input**; 2166 / 1M × 2.50 = **0.0054150 output**; Gemini = 0.0097638; más 0.0080000 → **0.0177638**.
- RRHH: 10519 / 1M × 0.30 = **0.0031557 input**; 889 / 1M × 2.50 = **0.0022225 output**; Gemini = 0.0053782; más 0.0080000 → **0.0133782**.

Comprobación agregada: input **0.0103320** + output **0.0088200** + búsqueda **0.0160000** = **0.0351520**.

## E. Promedio y representatividad

Promedio equivalente de las tres corridas = 0.0351520 / 3 = **USD 0.011717333…**. Promedio monetario observado = **USD 0**.

Es el proxy operativo solicitado, no una medición de tres sesiones homogéneas ni del costo por aprendizaje exitoso. SLA usa seed y sí llega a score/feedback; DSO genera módulo/quiz pero se detiene por fallo pedagógico; RRHH sólo propone una ruta. El consumo de DSO se incluye porque ocurrió, aunque su contenido fue rechazado. No se inventan los costos de completar ese flujo ni de estudiar módulos RRHH. Una muestra de tres recorridos no permite estimar distribución de costos, tasa futura de fallos o costo por alumno.

## F. Escenario de uso serio

**Hipótesis explícita, no usage observado ni forecast:** 10 sesiones/semana × 52 semanas = **520 sesiones/año**. Se aplica el promedio exacto anterior, sin incluir calibración.

| Concepto | Fórmula | Resultado |
|---|---|---:|
| Equivalente semanal | (0.035152 / 3) × 10 | **USD 0.117173333…** |
| Equivalente anual | (0.035152 / 3) × 520 | **USD 6.093013333…** |
| Gemini anual | 0.006384 × 520 | USD 3.3196800 |
| Tavily anual equivalente | (2 / 3) × 520 × 0.008 | USD 2.773333333… |
| Búsquedas/créditos por corrida | 2 / 3 | 0.666666667… |
| Créditos semanales | (2 / 3) × 10 | 6.666666667… |
| Créditos anuales | (2 / 3) × 520 | 346.666666667… |
| Créditos mensuales medios | (2 / 3) × 520 / 12 | **28.888888889…** |

Los créditos fraccionarios son medias del escenario, no una búsqueda fraccionada facturable. La media mensual no garantiza una distribución uniforme ni cubre ráfagas. Las sesiones futuras pueden variar en longitud de historial, respuestas, búsquedas y reintentos.

## G. Qué permite concluir Free Tier

**Bajo las condiciones publicadas y el patrón de uso proyectado**, Tavily consumiría en promedio **28.89 créditos/mes**, alrededor del **2.89%** de los 1,000 créditos/mes de Researcher. Es compatible con esa cuota si se mantiene el perfil, no hay concentración excesiva ni otros usos de la misma cuenta consumiendo el cupo. No se equipara cuota mensual a bolsa anual acumulable.

La referencia Gemini declara input/output free of charge para el modelo en Free Tier. **No se dispone aquí de límites verificados suficientes de solicitudes/tokens por minuto o día y de la cuenta concreta para garantizar 520 sesiones/año.** El volumen anual por sí solo no prueba viabilidad de ráfagas. No se inventan cuotas ni se promete disponibilidad.

El escenario es compatible con bajo desembolso bajo esas condiciones, pero no garantiza gratuidad futura. Cambios de tarifas, elegibilidad, límites, consumo compartido o activación futura de pago alterarían la conclusión. El equivalente Paid/PAYG se calcula independientemente del saldo gratuito; no se descuentan créditos gratis en esa comparación contrafactual.

## H. Iteración/calibración separada

**Costo de iteración/calibración observado en consumo**, valorado a tarifas equivalentes: DSO reanudación. No es costo monetario pagado ni cuarta corrida académica.

```text
Input: 15468 / 1M × 0.30 = USD 0.0046404
Output: 1945 / 1M × 2.50 = USD 0.0048625
Gemini:                    USD 0.0095029
Tavily: 1 × 0.008 =         USD 0.0080000
Total equivalente:         USD 0.0175029
Monetario observado:        USD 0
```

Esta ejecución conservó un segundo fallo pedagógico y no produjo intento/score/feedback. **Se excluye del promedio, del semanal y del anual.** Su costo no desaparece por tratarse de un resultado rechazado.

Control contable opcional de los cuatro consumos analizados: 0.0351520 principal + 0.0175029 iteración = **USD 0.0526549 equivalente**, con **USD 0 observado**. No es el costo completo de desarrollo: Fase 5 y pruebas aisladas anteriores quedan fuera de este subtotal. La misión permite pero no exige valorarlas; no se mezclan logs incompletos ni se estima consumo ausente para obtener un total general.

## I. Elección del modelo

OpenAI fue la implementación inicial, sin validación externa por falta de credencial. Se priorizó validar sin gasto. Gemini 2.5 Flash y Flash-Lite fueron rechazados para usuarios nuevos según la historia preservada; Flash tiene 404 crudo y Flash-Lite la limitación documental indicada en [DECISIONES D12](DECISIONES.md#d12--verificación-mínima-de-gemini-25-flash-lite). Gemini 3.5 Flash-Lite fue validado con inferencia real, function calling, Structured Outputs y las operaciones del tutor junto con Tavily/AJV.

**Gemini 3.5 Flash-Lite es el modelo de menor costo que fue efectivamente validado en este proyecto y demostró realizar las funciones requeridas.** No significa que sea el más barato existente ni que haya ganado un benchmark comparativo. Su costo publicado es bajo para el volumen medido. No existe evidencia comparativa del proyecto que justifique un modelo mayor para las tareas actuales; tampoco evidencia que demuestre que uno mayor resolvería DSO.

Los fallos pedagógicos persisten como límite del sistema: funcionalidad demostrada no equivale a exactitud universal. La decisión económica no sustituye supervisión. El prompt armonizado en Fase 8 no se reejecutó; esta valoración usa las versiones realmente ejecutadas en Fase 6.

## J. Eficiencia: qué determina el costo

| Componente principal | Equivalente USD | Proporción aproximada de las tres corridas |
|---|---:|---:|
| Input Gemini | 0.0103320 | 29.39% |
| Output Gemini | 0.0088200 | 25.09% |
| Búsquedas Tavily | 0.0160000 | 45.52% |

Gemini combinado representa 54.48%, pero Tavily es el componente individual mayor del conjunto. En DSO dinámico, Gemini domina **54.96%** frente a Tavily **45.04%**; en RRHH, Tavily domina **59.80%** frente a Gemini **40.20%**. SLA no tiene búsqueda y su input cuesta más que su output. En DSO, el output cuesta más que el input pese a tener menos tokens, por la tarifa distinta.

Las oportunidades futuras son evitar búsquedas o contexto redundantes sólo cuando pueda conservarse vigencia y trazabilidad, y medir el costo de errores/reintentos junto con calidad. No se implementa caché, cambio de modelo, reducción de prompts ni otra optimización en esta fase. La búsqueda real y la revisión humana no se eliminan para abaratar una muestra.

## K. Documentación y QA

Archivos de esta fase:

- `ECONOMIA.md` (este archivo): análisis completo y cierre A–M, evitando duplicación en otro informe.
- `README.md`: resumen económico y enlace al análisis; sustituye el pendiente económico por resultados y límites.
- `DECISIONES.md`: decisión D27 añadida sobre tarifas, supuesto y alcance, sin reescribir D01–D26.

QA offline: contraste de las cuatro sumas de usage, separación por proveedor, aritmética por unidades enteras, sumas/promedios/proyecciones, enlaces locales, comparación de hashes para preservar evidencia, escaneo de secretos y `git diff --check`. No se repiten tests funcionales ni se consulta facturación. Las fuentes externas se citan según la misión; no se afirma una validación de enlace o precio en vivo. Resultados: cálculo PASS; 102 referencias locales con destino existente; 85 entradas de manifiestos verificadas, cero fallos; cero coincidencias de claves en los tres documentos. Comparación de 124 archivos: sólo README, DECISIONES y el nuevo ECONOMIA cambiaron, sin eliminaciones. D01–D26 permanecen como prefijo íntegro, con D27 añadido. Diff-check sin errores de espacios; el archivo nuevo produjo únicamente un aviso Git de normalización LF/CRLF.

## L. Gaps y límites

El análisis cubre consumo API documentado, no costo total de propiedad: no incluye trabajo humano, revisión pedagógica, desarrollo, alojamiento, electricidad, impuestos u operación; no hay datos suficientes para valorarlos. El USD 0 observado no es auditoría bancaria. Se requieren cuotas reales y distribución temporal para garantizar volumen Gemini. Las condiciones económicas pueden cambiar. La muestra heterogénea y pequeña no estima todas las sesiones futuras; los fallos preservados impiden equiparar costo por corrida con costo por aprendizaje aprobado. Fase 5 queda fuera del subtotal, no se le asigna costo cero.

## M. Conclusión

**FASE 9 COMPLETE.** Tres corridas: **USD 0 monetario observado**, **USD 0.0351520 equivalente**, promedio **USD 0.011717333…**. Escenario hipotético de 520 sesiones/año: **USD 6.093013333… equivalente**, con **28.89 créditos Tavily/mes medios**. Calibración DSO separada: **USD 0.0175029 equivalente**.

Resultado condicionado a las tarifas y al patrón de referencia; no promesa de gratuidad permanente. Sin nuevas APIs, generaciones, cambios funcionales, prompts o evidencia. No se ejecutó Fase 10 ni commit/push/PR/merge.
