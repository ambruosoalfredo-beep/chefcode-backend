/**
 * ChefCode Configuration - Environment Settings
 * Gestisce le configurazioni per diversi ambienti
 */

// Rileva se è ambiente development o production
// Per APK/mobile usa sempre production, per web browser usa development se localhost
const isDevelopment = typeof window !== 'undefined' 
  ? (window.location.protocol === 'file:' ? false : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  : process.env.NODE_ENV === 'development';

const config = {
  // Backend API URLs
  api: {
    // URL del server Render deployato
    production: 'https://chefcode-backend-1.onrender.com',
    development: 'http://localhost:3000'
  },
  
  // Ottieni l'URL corretto basato sull'ambiente
  getApiUrl() {
    // Per APK/Capacitor usa sempre production
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      return this.api.production;
    }
    return isDevelopment ? this.api.development : this.api.production;
  },
  
  // Configurazioni specifiche per mobile
  mobile: {
    // Timeout per le richieste (millisecondi)
    timeout: 10000,
    // Retry automatico per chiamate fallite
    retryAttempts: 3,
    // Intervallo tra i retry (millisecondi)
    retryDelay: 1000
  },
  
  // Configurazioni per debug
  debug: {
    enableLogging: isDevelopment,
    logApiCalls: isDevelopment
  },
  
  // Informazioni app
  app: {
    name: 'ChefCode',
    version: '1.0.0',
    environment: isDevelopment ? 'development' : 'production'
  }
};

// Log della configurazione in development
if (config.debug.enableLogging) {
  console.log('🔧 ChefCode Config:', {
    environment: config.app.environment,
    apiUrl: config.getApiUrl(),
    isDevelopment
  });
}

export default config;