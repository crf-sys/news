// Ámbitos de edición. "es" es la edición nacional. `active` = ya se publica edición diaria.
export const REGIONS = [
  { id: "es", name: "España", short: "Nacional", active: true },
  { id: "andalucia", name: "Andalucía", short: "Andalucía", active: true },
  { id: "cataluna", name: "Cataluña", short: "Catalunya", active: true },
  { id: "madrid", name: "Comunidad de Madrid", short: "Madrid", active: true },
  { id: "paisvasco", name: "País Vasco", short: "Euskadi", active: true },
  { id: "valencia", name: "Comunitat Valenciana", short: "C. Valenciana", active: false },
  { id: "galicia", name: "Galicia", short: "Galicia", active: false },
  { id: "castillayleon", name: "Castilla y León", short: "Castilla y León", active: false },
  { id: "canarias", name: "Canarias", short: "Canarias", active: false },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];
export const region = (id: string) => REGIONS.find((r) => r.id === id);
export const ACTIVE_REGIONS = REGIONS.filter((r) => r.active);
