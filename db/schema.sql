-- Ágora · esquema Postgres (Neon) + pgvector. Primera versión.
create extension if not exists vector;

create table if not exists outlets (
  id text primary key, name text not null, url text not null,
  lean smallint not null check (lean between -2 and 2),
  lean_source text not null,          -- de dónde sale la posición (auditable)
  ownership text
);

-- Cualquier persona cuya opinión seguimos: columnista, líder de opinión, académico…
create table if not exists voices (
  id text primary key, name text not null,
  kind text not null check (kind in ('columnista','lider_opinion','periodista','academico','think_tank')),
  outlet_id text references outlets(id),          -- null = independiente
  inclusion_reason text not null,                 -- público
  status text not null default 'calibrando',      -- calibrando | activo | pausado
  created_at timestamptz default now()
);

create table if not exists voice_channels (                     -- de dónde leemos a cada voz
  id serial primary key, voice_id text references voices(id) on delete cascade,
  kind text not null check (kind in ('rss','newsletter','web','social','podcast')),
  value text not null
);

create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  outlet_id text references outlets(id), voice_id text references voices(id),
  url text unique not null, title text not null, excerpt text,      -- nunca el cuerpo completo
  kind text not null, via text not null, published_at timestamptz not null,
  front_page_rank smallint, embedding vector(1536)
);

-- Un TEMA vive varios días (p.ej. "Presupuestos 2027"); cada día puede entrar o no en el top 10.
create table if not exists topics (
  id text primary key, title text not null, section text not null,
  first_seen date not null, last_seen date not null
);
create table if not exists topic_days (                         -- la edición diaria
  topic_id text references topics(id), day date, rank smallint,
  headline text not null, dek text not null, score real not null,
  primary key (topic_id, day)
);
create table if not exists article_topics (article_id uuid references articles(id), topic_id text references topics(id), primary key (article_id, topic_id));

-- Afirmaciones con trazabilidad completa: cada una apunta a los artículos que la sostienen.
create table if not exists claims (
  id serial primary key, topic_id text references topics(id), day date,
  text text not null, status text not null check (status in ('hecho','disputado','opinion'))
);
create table if not exists claim_sources (claim_id int references claims(id), article_id uuid references articles(id), supports boolean not null, primary key (claim_id, article_id));

-- Opinión de una voz sobre un tema → alimenta "Otras visiones".
create table if not exists voice_takes (
  article_id uuid references articles(id), voice_id text references voices(id), topic_id text references topics(id),
  take text not null,                              -- resumen neutro de 1 frase
  primary key (article_id, topic_id)
);

-- Ficha ideológica: una fila por voz, eje y semana (permite ver evolución en el tiempo).
create table if not exists voice_axis_scores (
  voice_id text references voices(id), axis text not null, week date not null,
  value real not null, confidence real not null, evidence int not null,
  primary key (voice_id, axis, week)
);
create table if not exists axis_evidence (voice_id text, axis text, article_id uuid references articles(id), quote text not null, value real not null);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(), email text unique not null,
  confirmed_at timestamptz, unsubscribed_at timestamptz, created_at timestamptz default now()
);

-- Registro de cambios editoriales (quién cambió qué y por qué): transparencia interna.
create table if not exists audit_log (id bigserial primary key, actor text, entity text, entity_id text, change jsonb, reason text, at timestamptz default now());

-- Lecturas humanas desde /admin/editor (medios sin lectura automática).
create table if not exists editor_notes (
  id uuid primary key default gen_random_uuid(),
  topic_id text not null, outlet_id text references outlets(id), voice_id text references voices(id),
  url text not null, kind text not null,
  claims text not null, framing text, opinions text,
  editor text, created_at timestamptz default now()
);

create index if not exists articles_published_idx on articles (published_at desc);
create index if not exists articles_outlet_idx on articles (outlet_id, published_at desc);

-- Ámbito de cada medio: 'es' (nacional) o el id de la comunidad autónoma.
alter table outlets add column if not exists region text not null default 'es';
alter table outlets add column if not exists access text not null default 'licencia';

-- Edición diaria publicada por ámbito (nacional o autonómico). `stories` guarda el informe completo
-- generado por el pipeline (afirmaciones, verificaciones, enfoques, fuentes).
create table if not exists editions (
  region text not null, day date not null,
  generated_at timestamptz not null default now(),
  model text not null, stats jsonb not null, stories jsonb not null,
  primary key (region, day)
);

-- Propuestas públicas de voces a analizar (/proponer). El email es opcional y solo con consentimiento.
create table if not exists voice_proposals (
  id uuid primary key default gen_random_uuid(),
  name text not null, url text, kind text not null, reason text not null,
  email text, consent_at timestamptz,
  status text not null default 'pendiente' check (status in ('pendiente','aceptada','descartada')),
  review_note text, created_at timestamptz default now()
);

-- Una misma URL puede pertenecer a varios ámbitos (p. ej. RTVE y RTVE Andalucía): unicidad por medio + URL.
alter table articles drop constraint if exists articles_url_key;
create unique index if not exists articles_outlet_url_idx on articles (outlet_id, url);
-- Línea editorial vacía = sin calibrar.
alter table outlets alter column lean drop not null;

-- Límite de peticiones para formularios públicos. Solo se guarda un hash de la IP, nunca la IP.
create table if not exists rate_limits (
  key text not null, window_start timestamptz not null, count int not null default 0,
  primary key (key, window_start)
);

-- Lectura asistida de portadas: un editor revisa a mano las portadas de los medios que no permiten
-- lectura automática y marca qué temas del día llevan y en qué posición.
create table if not exists front_page_reviews (
  day date not null, outlet_id text not null references outlets(id), editor text not null,
  reviewed_at timestamptz not null default now(), primary key (day, outlet_id)
);
create table if not exists front_page_marks (
  day date not null, outlet_id text not null references outlets(id), topic_id text not null,
  position smallint, editor text not null, updated_at timestamptz not null default now(),
  primary key (day, outlet_id, topic_id)
);
-- Noticias que un medio lleva en portada y que no están entre los temas detectados.
create table if not exists front_page_extra (
  id uuid primary key default gen_random_uuid(), day date not null, outlet_id text not null references outlets(id),
  headline text not null, url text, position smallint, editor text not null, created_at timestamptz default now()
);

-- Entrada por API externa: texto completo opcional y declaración de derechos de cada pieza.
alter table articles add column if not exists body text;
alter table articles add column if not exists rights text;
alter table articles add column if not exists section text;
alter table articles add column if not exists author text;

-- API de ingesta v1.1: lotes idempotentes, registro bruto y capturas de portada.
create table if not exists ingest_batches (
  batch_id text primary key, provider text not null, received_at timestamptz not null default now(),
  items int not null, snapshots int not null, result jsonb not null,
  raw jsonb not null  -- copia del lote recibido (sin el campo "text") para no perder nada
);
create table if not exists front_page_snapshots (
  id uuid primary key default gen_random_uuid(), outlet_id text not null references outlets(id),
  provider text not null, batch_id text, captured_at timestamptz not null, screenshot_url text,
  unique (outlet_id, provider, captured_at)
);
create table if not exists front_page_snapshot_items (
  snapshot_id uuid not null references front_page_snapshots(id), position smallint not null,
  url text not null, title text, primary key (snapshot_id, position)
);
alter table articles add column if not exists provider text;

-- Registro de lectores (newsletter "Las 10 de hoy"): doble confirmación y baja con un clic.
alter table subscribers add column if not exists consent_at timestamptz;
alter table subscribers add column if not exists consent_text text;
alter table subscribers add column if not exists region text not null default 'es';
alter table subscribers add column if not exists confirm_token text;
alter table subscribers add column if not exists unsubscribe_token text;
alter table subscribers add column if not exists last_sent_on date;
create unique index if not exists subscribers_confirm_idx on subscribers (confirm_token);
create unique index if not exists subscribers_unsub_idx on subscribers (unsubscribe_token);
create table if not exists newsletter_sends (
  day date not null, region text not null, sent int not null, failed int not null,
  at timestamptz not null default now(), primary key (day, region)
);

-- Registro de licencias: activar un medio con reserva exige documentar la licencia o autorización.
create table if not exists outlet_licenses (
  id uuid primary key default gen_random_uuid(),
  outlet_id text not null references outlets(id),
  licensor text not null,          -- quién concede: el editor, CEDRO, un proveedor licenciado…
  reference text not null,         -- nº de contrato, email de autorización, etc.
  scope text not null check (scope in ('metadatos', 'texto_completo')),
  valid_from date not null, valid_until date,
  document_url text,
  activated_by text not null, activated_at timestamptz not null default now(),
  revoked_by text, revoked_at timestamptz
);
create index if not exists outlet_licenses_active_idx on outlet_licenses (outlet_id) where revoked_at is null;

-- Alcance "titulares" (antes "metadatos"): solo titular, enlace y posición en portada.
alter table outlet_licenses drop constraint if exists outlet_licenses_scope_check;
update outlet_licenses set scope = 'titulares' where scope = 'metadatos';
alter table outlet_licenses add constraint outlet_licenses_scope_check check (scope in ('titulares', 'texto_completo'));
