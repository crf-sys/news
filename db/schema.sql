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
