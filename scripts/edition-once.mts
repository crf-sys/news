// Genera una edición a mano (lo mismo que el cron): npx tsx --env-file=.env.local scripts/edition-once.mts [region]
import { buildEdition } from "../src/lib/pipeline";
import { latestEdition } from "../src/lib/editions";

const region = process.argv[2] ?? "es";
console.log(await buildEdition(region));
const ed = await latestEdition(region);
for (const s of ed?.stories ?? []) {
  const o = s.objectivity!;
  console.log(`\n${s.rank}. ${s.headline}\n   ${o.outlets} medios · ${s.claims.length} afirmaciones (${o.verified} verificadas) · confianza ${o.confidence}`);
  for (const c of s.claims.slice(0, 3)) console.log(`   [${c.status}] ${c.text}${c.verification ? ` → ${c.verification.result} ${c.verification.sourceName ?? ""}` : ""}`);
}
