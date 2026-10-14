# Especificación para el sistema que envía noticias a Ágora

## Qué enviar
- **Todo lo publicado** por cada medio en las últimas 24 h, sin filtrar ni resumir. **Los duplicados no importan**: Ágora los detecta (misma URL = misma pieza) y actualiza la que ya tiene.
- Prioridad de secciones: **portada**, política/España, economía, internacional, sociedad, tribunales y **opinión** (columnas, editoriales, tribunas).
- **Portada**: cada 2–4 h, una "foto" de la portada con la **posición** de cada pieza (1 = apertura). Es la señal más importante para saber qué es lo más destacado.
- **Opinión**: siempre con **autor**.
- **Texto completo** si lo tienes. Si no, con titular y entradilla basta.
- Medios: los 10 nacionales (elpais, elmundo, abc, lavanguardia, elconfidencial, eldiario, larazon, elespanol, 20minutos, rtve), El Independiente y los autonómicos del panel (ver `src/lib/sources.ts`). Puedes usar el id o simplemente la URL: se reconoce por el dominio.
- Frecuencia: entre 3 y 6 envíos al día, en lotes de hasta 500 piezas.

## Derechos (obligatorio)
Indica en cada pieza con qué derecho la envías, en `rights`:
- `"licenciado"`: hay licencia o permiso del editor que cubre el análisis automatizado.
- `"publico"`: el medio no se reserva la minería de textos.
- `"sin_licencia"` (valor por defecto): se guarda, pero **no se analiza** si el medio se reserva la minería de textos (art. 67.3 RDL 24/2021).

## Cómo enviarlo
`POST https://agora10.com/api/ingest`
Cabeceras: `Authorization: Bearer <INGEST_API_KEY>` y `Content-Type: application/json`.
La clave está en Vercel → proyecto `news` → Settings → Environment Variables → `INGEST_API_KEY`.

```json
{
  "items": [
    {
      "outlet": "elpais",
      "url": "https://elpais.com/espana/2026-10-15/ejemplo.html",
      "title": "Titular tal como aparece",
      "subtitle": "Entradilla o subtítulo",
      "text": "Texto completo (opcional)",
      "section": "España",
      "author": "Nombre del autor",
      "kind": "noticia",
      "published_at": "2026-10-15T06:12:00+02:00",
      "front_page": { "position": 1, "captured_at": "2026-10-15T07:00:00+02:00" },
      "rights": "licenciado"
    }
  ]
}
```

- `kind`: `noticia` | `opinion` | `analisis` | `entrevista` | `editorial`.
- `published_at` y `captured_at`: ISO 8601 con zona horaria.
- Obligatorios: `outlet`, `url`, `title` y `published_at`.

## Respuesta
`{"received": 120, "saved": 118, "rejected": [{"url": "...", "reason": "Medio desconocido: ..."}]}`
`401` si la clave no es válida · `400` con la lista de errores si el formato no es correcto.
