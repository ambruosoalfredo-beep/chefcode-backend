/**
 * ChefCode Mobile - Configurazione Backend Cloud
 * IMPORTANTE: Aggiorna RENDER_URL dopo il deploy!
 */

// 🚀 URL RENDER CONFIGURATO:
const RENDER_URL = 'https://chefcode-backend-1.onrender.com';

// Configurazione dinamica per produzione
const BackendConfig = {
  // URL del backend (da aggiornare dopo deploy Render)
  baseURL: RENDER_URL,
  
  // Configurazioni per produzione
  timeout: 15000, // 15 secondi (Render può essere lento al primo avvio)
  retryAttempts: 3,
  retryDelay: 2000,
  
  // Health check automatico
  healthCheckInterval: 30000, // 30 secondi
  
  // Debug (solo per testing)
  enableDebug: false,
  
  // Metodi di utilità
  getApiUrl() {
    return this.baseURL;
  },
  
  isProduction() {
    return !this.enableDebug;
  },
  
  log(message, data = null) {
    if (this.enableDebug) {
      console.log(`🔗 ChefCode Backend: ${message}`, data || '');
    }
  }
};

export default BackendConfig;