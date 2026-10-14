import { collectAll } from "../src/lib/collector";

const { batches, coverage } = await collectAll();
console.table(coverage);
console.log("Lotes:", batches.length, "piezas:", batches.reduce((sum, batch) => sum + batch.items.length, 0), "capturas:", batches.reduce((sum, batch) => sum + batch.snapshots.length, 0));
