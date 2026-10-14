# Revisión legal de fuentes — 14/10/2026

Revisión automática + manual de `robots.txt` y avisos legales de los 10 medios del panel.
**No es asesoramiento jurídico**: sirve para priorizar y debe validarlo un abogado de propiedad intelectual.

Clave: el art. 67.3 del RDL 24/2021 (que transpone el art. 4.3 de la Directiva UE 2019/790) permite al titular
**reservarse** la minería de textos y datos. Si lo hace, analizar sus contenidos de forma automatizada requiere licencia.

| Medio | Reserva minería de textos / IA | robots.txt | Modo en Ágora |
|---|---|---|---|
| El País | **Sí**, expresa (art. 67.3) + frente a IA + revistas de prensa (32.1) | Bloquea ClaudeBot, CCBot, PerplexityBot | Lectura humana · licencia |
| El Mundo | **Sí**, expresa, incl. "procedimientos automatizados de extracción" | Bloquea GPTBot, anthropic-ai, CCBot, Google-Extended… | Lectura humana · licencia |
| ABC | **Sí**, expresa (art. 67.3 + Directiva 4.3) | Bloquea GPTBot, ClaudeBot, CCBot… | Lectura humana · licencia |
| La Vanguardia | **Sí**, expresa (apdo. 7.2: minería, IA y respuestas de modelos) | Bloquea `/premium/` a todos | Lectura humana · licencia |
| 20minutos | **Sí**, expresa, incl. "web scraping, crawling" | Bloquea GPTBot, ClaudeBot… | Lectura humana · licencia |
| El Confidencial | No detectada en condiciones; reutilización "precisa de licencia" | Bloquea **todos** los bots de IA | Lectura humana · licencia |
| La Razón | No detectada | Bloquea los principales bots de IA | Lectura humana · licencia |
| elDiario.es | No detectada | Sin bloqueos de IA | **Automático (RSS)** |
| El Español | No detectada; prohíbe reproducir con fines comerciales (32.1) | Sin bloqueos de IA | **Automático (RSS)**, solo metadatos |
| RTVE | No detectada (reserva genérica de derechos) | Sin bloqueos de IA | **Automático (RSS)** |

## Reglas que aplica Ágora
- Medios en modo automático: solo titular, enlace, fecha, autor y extracto ≤ 280 caracteres. Nunca el cuerpo.
- Bot identificado (`AgoraBot/0.1; +https://agora10.com/metodologia`), ≤ 4 lecturas al día, respeta `robots.txt`.
- Medios con reserva: solo lectura humana; el editor escribe un resumen propio (casilla de redacción propia obligatoria).
- No se automatiza el acceso a zonas de suscriptor salvo licencia o permiso por escrito que lo cubra.
- No se eluden muros de pago, CAPTCHAs ni sistemas antibots.
- Tras revisión jurídica interna, `METADATA_ONLY_OUTLETS` permite recoger feeds públicos de un
  medio sin presentar esa autorización como licencia. Las piezas entran como `sin_licencia` y no
  pasan al análisis automático. El País (HTTP 403 al bot identificado) y El Confidencial
  (restricción de rastreo) permanecen bloqueados hasta disponer de un canal autorizado.

## Pendiente
- Solicitar licencia/permiso a los 7 medios con reserva (ver `docs/EMAILS.md`) y consultar a CEDRO.
- Repetir esta revisión cada trimestre: las condiciones cambian.

## Ampliación 14/10/2026 — radios, alternativos y medios de columnistas

| Medio | Reserva minería / IA | robots.txt IA | Modo |
|---|---|---|---|
| Cadena SER (PRISA) | **Sí**, expresa (art. 67.3) + frente a IA | Bloquea ClaudeBot, CCBot, PerplexityBot | Licencia |
| Onda Cero (Atresmedia) | **Sí**, expresa (minería + entrenamiento de IA) | — | Licencia |
| COPE | No detectada en aviso legal | Bloquea **todos** los bots de IA | Licencia |
| RAC1 (Godó) | **Sí**, expresa (art. 67.3 + IA) | Bloquea GPTBot, ClaudeBot… | Licencia |
| Catalunya Ràdio (3Cat) | **Sí**, expresa (ver revisión autonómica) | — | Licencia |
| RNE (RTVE) | No detectada | — | **Automático** |
| esRadio / Libertad Digital | Aviso legal no localizado desde la home | Sin bloqueos | Pendiente de revisión manual |
| Público | No detectada | Sin bloqueos | **Automático** cuando se localice un feed válido (no hay RSS público; valorar sitemap de noticias) |
| infoLibre | No detectada | Bloquea los principales bots de IA | Licencia |
| El Independiente | No detectada | Sin bloqueos | **Automático** (feed: /feed/) |

Consecuencia para el "Especial Radios": de las grandes, solo RNE puede analizarse automáticamente hoy. SER, Onda Cero, COPE, RAC1 y Catalunya Ràdio requieren licencia o lectura humana desde el panel de edición.
