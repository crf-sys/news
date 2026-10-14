// Datos del titular para las páginas legales. PENDIENTE: completar con los datos reales de la empresa
// (razón social, NIF, domicilio, email de privacidad) antes del lanzamiento público.
export const TITULAR = {
  name: process.env.LEGAL_NAME ?? "[Razón social pendiente]",
  nif: process.env.LEGAL_NIF ?? "[NIF pendiente]",
  address: process.env.LEGAL_ADDRESS ?? "[Domicilio pendiente]",
  email: process.env.LEGAL_EMAIL ?? "privacidad@agora10.com",
  updated: "14 de octubre de 2026",
};
