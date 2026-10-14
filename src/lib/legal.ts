// Datos del titular para las páginas legales. PENDIENTE: completar con los datos reales de la empresa
// (razón social, NIF, domicilio, email de privacidad) antes del lanzamiento público.
export const TITULAR = {
  name: process.env.LEGAL_NAME ?? "2050 CONSULTING LLC",
  nif: process.env.LEGAL_NIF ?? "[EIN pendiente]",
  address: process.env.LEGAL_ADDRESS ?? "[Domicilio pendiente]",
  email: process.env.LEGAL_EMAIL ?? "2050@consulting2050.com",
  updated: "14 de octubre de 2026",
};
