# Ágora · Contrato de ingesta v1.1

**Alcance del proveedor:** barrido, captura de portada y entrega del dato en bruto. Ágora hace todo el análisis.

## 1. Envío
`POST https://agora10.com/api/ingest`
Cabeceras: `Authorization: Bearer <INGEST_API_KEY>` · `Content-Type: application/json`
La clave se entrega por un canal seguro. Nunca por email ni en el código.

```json
{
  "batch_id": "proveedor-2026-10-15T05:10:00Z-0001",
  "provider": "nombre-del-proveedor",
  "items": [ ...hasta 500 piezas... ],
  "snapshots": [ ...hasta 60 capturas de portada... ]
}
```

### Pieza (`items[]`)
| Campo | Obligatorio | Notas |
|---|---|---|
| `outlet` | sí | id del medio (`elpais`, `eldiario`…) o cualquier texto si la URL basta para identificarlo por dominio |
| `url` | sí | URL canónica |
| `title` | sí | Titular tal como aparece |
| `published_at` | sí | ISO 8601 con zona horaria |
| `rights` | sí | `licenciado` · `publico` · `sin_licencia` (ver §3) |
| `subtitle` | recomendado | Entradilla |
| `author` | recomendado (**obligatorio en opinión**) | |
| `section` | recomendado | Sección del medio |
| `kind` | recomendado | `noticia` · `opinion` · `analisis` · `entrevista` · `editorial` |
| `text` | opcional | Texto completo, solo si `rights` lo permite |

### Captura de portada (`snapshots[]`)
Una captura por medio cada 2–4 h. Las posiciones se relacionan con las piezas **por URL**.
```json
{
  "outlet": "eldiario",
  "captured_at": "2026-10-15T07:00:00+02:00",
  "screenshot_url": "https://almacenamiento-del-proveedor/eldiario/2026-10-15T0700.png",
  "positions": [
    { "position": 1, "url": "https://www.eldiario.es/…", "title": "Titular" },
    { "position": 2, "url": "https://www.eldiario.es/…" }
  ]
}
```
- `screenshot_url` es opcional. La imagen la aloja el proveedor: Ágora solo guarda el enlace.
- La pieza de cada posición debe enviarse también en `items` (en el mismo lote o en otro).

## 2. Respuestas, reintentos y pérdidas
| Código | Significado | Qué hacer |
|---|---|---|
| `200` | Todo guardado | — |
| `207` | **Rechazo parcial**: lo válido se ha guardado y `rejected[]` indica índice, URL y motivo | Corregir y reenviar **solo** lo rechazado, en un lote nuevo |
| `400` | El lote no tiene la estructura básica | Corregir y reenviar el lote |
| `401` | Clave no válida | Revisar la clave; no reintentar en bucle |
| `5xx` o timeout | Fallo temporal | **Reintentar el mismo lote con el mismo `batch_id`**: 1 min, 5 min, 15 min, 1 h y después alerta |

- **Idempotencia:** reenviar un `batch_id` ya procesado devuelve el resultado original (`duplicate_batch: true`) sin duplicar nada.
- **Repeticiones:** enviad todo aunque se repita. La misma URL del mismo medio actualiza la pieza, y Ágora conserva una copia bruta de cada lote.
- `warnings[]` informa de ajustes que no son error. Por ejemplo, `rights` rebajado a `sin_licencia` (ver §3).

## 3. Derechos
- **El proveedor asigna `rights` y Ágora no lo deduce.**
- Para los medios que se reservan la minería de textos (El País, El Mundo, ABC, La Vanguardia, 20minutos, El Confidencial y La Razón, además de los autonómicos indicados en `docs/FUENTES-LEGAL.md`), `licenciado` **solo se acepta si ese medio figura en la lista de licencias validadas por Ágora**. Esa lista se actualiza tras revisar la documentación de la licencia del proveedor.
- Si el medio no está validado, la pieza **se guarda como `sin_licencia`, queda fuera del análisis automático** y la respuesta lo indica en `warnings`.
- **Fase actual:** no se exige documentación de licencias. El piloto usa solo medios que no se reservan la minería de textos, así que pueden enviarse con `rights: "publico"`. La matriz de licencias por medio se pedirá cuando se quiera ampliar a los medios con reserva.
- Una aprobación jurídica interna para recoger metadatos públicos no se presenta como licencia:
  esas piezas se envían con `rights: "sin_licencia"`, se guardan y no entran en el análisis automático.

## 4. Volumen y calendario
- Unos 30 medios, 3.000–8.000 piezas al día y capturas de portada cada 2–4 h.
- Entre 3 y 6 entregas al día. **Una debe llegar antes de las 05:30 (hora de Madrid)**: la edición se genera a las 06:00.

## 5. Piloto (1 semana)
**Medios propuestos:** elDiario.es y El Español (no se reservan la minería y además los leemos por RSS, así que podemos cotejar la cobertura) y Telemadrid (autonómico).

**Se da por bueno si, durante 7 días:**
- hace 3–6 entregas diarias y una llega antes de las 05:30;
- recorre todas las secciones acordadas;
- captura la portada cada 2–4 h con hora y posición;
- envía lotes de hasta 500 piezas;
- gestiona bien las respuestas 400, 401 y 207 y los reintentos con el mismo `batch_id`;
- no pierde datos ante fallos temporales (cotejo con nuestros RSS: ≥ 98 % de lo publicado);
- respeta el robots.txt y las condiciones de cada medio.
