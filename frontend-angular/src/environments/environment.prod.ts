// Entorno de producción (Render). Debe coincidir con la URL pública del Web Service.
export const environment = {
  production: true,
  apiUrl: 'https://hospital-backend-9wx6.onrender.com',
  // Reemplazar por la Site Key real de Cloudflare Turnstile (la de prueba siempre pasa)
  turnstileSiteKey: '1x00000000000000000000AA'
};
