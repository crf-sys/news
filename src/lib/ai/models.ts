// Modelos vía Vercel AI Gateway (autenticación OIDC automática en Vercel).
// Nacional: el modelo más capaz para el análisis; autonómicas: uno más barato.
export const MODELS = {
  analysisNational: process.env.MODEL_ANALYSIS ?? "anthropic/claude-sonnet-5.5",
  analysisRegional: process.env.MODEL_ANALYSIS_REGIONAL ?? "anthropic/claude-haiku-5.5",
  embedding: "openai/text-embedding-3-small",
} as const;
