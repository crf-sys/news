# Ágora — arquitectura v0

> Cultura política y de actualidad: las 10 noticias del día según los 10 grandes medios, separando hechos de opinión, con las ideologías de cada fuente a la vista.

## Producto

| Pantalla | Ruta | Qué resuelve |
|---|---|---|
| Portada | `/` | Las 10 de hoy, con cobertura (x/10 medios) y espectro de quién las cubre |
| Informe objetivo | `/tema/[id]` | Hechos · Disputado · Opinión, enfoques por bloque, **otras visiones**, contexto |
| Columnistas | `/columnistas`, `/columnista/[id]` | Ficha ideológica medida (5 ejes + pruebas + confianza), tono hacia actores, destacados |
| Fuentes | `/fuentes` | Mapa ideológico de los medios (calibrado y con su fuente) |
| Newsletter | `/newsletter` | Alta con doble opt-in, envío diario 07:00 Madrid |
| Método | `/metodologia` | Fórmulas públicas de ranking y clasificación |
| Back-office | `/admin` | Alta de voces (columnistas, líderes de opinión, académicos…), equilibrio del panel |

## Flujo diario

```
05:00–06:00  Ingesta     RSS medios + columnistas · newsletters (buzón inbound) · orden de portadas
06:00        Clustering  embeddings → temas (un tema vive varios días)
06:10        Ranking     0.5 cobertura + 0.3 prominencia en portada + 0.2 columnistas
06:15        Análisis    LLM con salida estructurada → afirmaciones citadas, enfoques, voces
06:30        Publicación edición del día (web)
07:00        Newsletter  React Email + Resend, envío en lote
Semanal      Fichas      recálculo de ejes ideológicos por voz (histórico + evidencias)
```

Código: `src/lib/pipeline/*` (una etapa por archivo), endpoints en `src/app/api/cron/*`.

Los crons se activarán en F1 en `vercel.json`. En plan Hobby solo se permite 1 ejecución diaria por cron:
`/api/cron/daily` a las `0 4 * * *` y `/api/cron/newsletter` a las `0 5 * * *` (UTC; en invierno hay que ajustar +1 h o pasar a Pro).

## Modelo de datos

`docs/schema.sql`. Claves del diseño:

- **Voces genéricas** (`voices`): no solo columnistas; cualquier líder de opinión. El motivo de inclusión es público.
- **Temas persistentes** (`topics` + `topic_days`): "Presupuestos 2027" es un único hilo que aparece varios días → se puede ver su evolución y todas las visiones acumuladas.
- **Trazabilidad total**: `claims` → `claim_sources` → `articles`. Ninguna afirmación sin fuente.
- **Ideología medida, no asignada**: `voice_axis_scores` por semana + `axis_evidence` (cita literal breve + enlace).
- **`audit_log`**: cualquier cambio editorial queda registrado.

## Stack propuesto

Next.js 16 (App Router) en Vercel · Postgres (Neon) + pgvector · AI SDK + AI Gateway (embeddings + `generateObject`) · Resend (newsletter + inbound email) · Clerk para `/admin` · Vercel Cron / Workflow para el pipeline.

## Riesgos que hay que resolver pronto

1. **Derechos de autor / términos de uso.** Suscribirse con un email y leer las newsletters está bien; **republicar** sus contenidos no. En España la LPI (art. 32) limita reproducir fragmentos de prensa y varios medios lo prohíben en sus condiciones. Por eso Ágora solo guarda titular, enlace, fecha y un extracto breve, y genera **titulares y síntesis propios**. Antes de lanzar: revisión legal y, si es posible, acuerdos con los medios.
2. **Paywalls.** No saltarse muros de pago ni compartir accesos de suscripciones. Si se paga una suscripción, es para análisis interno, no para redistribuir el contenido.
3. **Neutralidad defendible.** La posición de medios y voces sale de fuentes externas (p. ej. Reuters Digital News Report) y de medición sobre textos, siempre con evidencia y nivel de confianza. Nunca se asigna a ojo. Colores neutros: ningún color de partido.
4. **Errores del LLM.** Regla "sin cita, no se publica" + cola de revisión humana para los temas dudosos y para las primeras semanas.
5. **Personas reales.** Las fichas de columnistas describen lo que escriben, no a la persona; tienen derecho de rectificación visible.

## Roadmap

- **F0 (hecho)**: esqueleto, diseño mobile-first, modelo de datos, datos de ejemplo.
- **F1**: RSS reales + Postgres + clustering + ranking → portada con datos reales (sin LLM todavía).
- **F2**: informe objetivo con LLM + revisión humana · newsletter 07:00.
- **F3**: alta de voces en `/admin` con backfill y fichas ideológicas · "otras visiones" sobre histórico.
- **F4**: ingesta por email, evolución temporal de temas, alertas por tema, app móvil (PWA).
