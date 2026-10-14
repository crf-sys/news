import { brandCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Ágora · Las 10 de hoy";

export default function Image() {
  return brandCard("Las 10 de hoy.", "Hechos separados de opinión · cada mañana a las 07:00");
}
