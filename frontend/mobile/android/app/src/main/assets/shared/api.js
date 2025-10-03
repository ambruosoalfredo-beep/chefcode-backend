/**
 * ChefCode API Layer - Condiviso tra Web e Mobile
 * Gestisce tutte le chiamate al backend
 */

// Import della configurazione (per compatibilità sia web che mobile)
let config;
try {
  // Prova a importare il modulo config
  if (typeof require !== 'undefined') {
    config = require('./config.js').default;
  } else {
    // Fallback intelligente: usa production per APK, development per browser localhost
    const isAPK = typeof window !== 'undefined' && window.location.protocol === 'file:';
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    config = { 
      getApiUrl: () => isAPK ? 'https://chefcode-backend-1.onrender.com' : (isLocalhost ? 'http://localhost:3000' : 'https://chefcode-backend-1.onrender.com')
    };
  }
} catch (e) {
  // Fallback se config non è disponibile - usa sempre production
  config = { getApiUrl: () => 'https://chefcode-backend-1.onrender.com' };
}

class ChefCodeAPI {
  constructor(baseURL = null) {
    // Usa la configurazione dinamica se disponibile
    this.baseURL = baseURL || (config ? config.getApiUrl() : 'http://localhost:3000');
    this.timeout = config?.mobile?.timeout || 10000;
    this.retryAttempts = config?.mobile?.retryAttempts || 3;
    this.retryDelay = config?.mobile?.retryDelay || 1000;
    
    // Log sempre per debug APK
    console.log('🌐 [ChefCodeAPI] Initialized with URL:', this.baseURL);
    console.log('🌐 [ChefCodeAPI] Window location:', typeof window !== 'undefined' ? window.location.href : 'undefined');
    console.log('🌐 [ChefCodeAPI] Protocol:', typeof window !== 'undefined' ? window.location.protocol : 'undefined');
    console.log('🌐 [ChefCodeAPI] Config available:', !!config);
  }

  // Configurazione per mobile (React Native / Flutter)
  setMobileConfig(config) {
    this.baseURL = config.baseURL || this.baseURL;
    this.token = config.token; // Per autenticazione future
    
    if (config?.debug?.enableLogging) {
      console.log('🔄 API URL updated to:', this.baseURL);
    }
  }

  // Test di connessione al backend
  async testConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseURL}/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (config?.debug?.enableLogging) {
        console.log('✅ Backend connection successful:', data);
      }
      
      return { success: true, data };
    } catch (error) {
      if (config?.debug?.enableLogging) {
        console.error('❌ Backend connection failed:', error.message);
      }
      return { success: false, error: error.message };
    }
  }

  // Metodo per cambiare URL backend
  setBackendUrl(newUrl) {
    this.baseURL = newUrl;
    if (config?.debug?.enableLogging) {
      console.log('🔄 Backend URL changed to:', this.baseURL);
    }
  }

  // ===== SYNC DATA =====
  async syncData(data) {
    try {
      const response = await fetch(`${this.baseURL}/api/sync-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Errore sincronizzazione:', error);
      throw error;
    }
  }

  // ===== CHATGPT AI =====
  async sendChatMessage(prompt) {
    try {
      console.log('🤖 [ChefCodeAPI] Sending ChatGPT request to:', `${this.baseURL}/api/chatgpt-smart`);
      console.log('🤖 [ChefCodeAPI] Prompt:', prompt);
      
      const requestBody = JSON.stringify({ prompt });
      console.log('🤖 [ChefCodeAPI] Request body:', requestBody);
      
      const response = await fetch(`${this.baseURL}/api/chatgpt-smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: requestBody
      });
      
      console.log('🤖 [ChefCodeAPI] Response status:', response.status);
      console.log('🤖 [ChefCodeAPI] Response headers:', response.headers);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('🤖 [ChefCodeAPI] Response data:', result);
      return result;
    } catch (error) {
      console.error('🚨 [ChefCodeAPI] ChatGPT Error:', error);
      console.error('🚨 [ChefCodeAPI] Error type:', error.constructor.name);
      console.error('🚨 [ChefCodeAPI] Error message:', error.message);
      console.error('🚨 [ChefCodeAPI] Error stack:', error.stack);
      throw error;
    }
  }

  // ===== INVENTORY =====
  async getInventory() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.inventory || [];
    } catch (error) {
      console.error('Errore recupero inventario:', error);
      throw error;
    }
  }

  async addInventoryItem(item) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'add-inventory',
          data: item
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Errore aggiunta inventario:', error);
      throw error;
    }
  }

  // ===== RECIPES =====
  async getRecipes() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.recipes || {};
    } catch (error) {
      console.error('Errore recupero ricette:', error);
      throw error;
    }
  }

  async saveRecipe(name, recipe) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'save-recipe',
          data: { name, recipe }
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Errore salvataggio ricetta:', error);
      throw error;
    }
  }

  // ===== TASKS =====
  async getTasks() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      const data = await response.json();
      return data.tasks || [];
    } catch (error) {
      console.error('Errore recupero task:', error);
      throw error;
    }
  }

  async addTask(task) {
    try {
      const response = await fetch(`${this.baseURL}/api/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({
          action: 'add-task',
          data: task
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Errore aggiunta task:', error);
      throw error;
    }
  }

  // ===== HEALTH CHECK =====
  async ping() {
    try {
      const response = await fetch(`${this.baseURL}/api/data`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Export per Web (browser)
if (typeof window !== 'undefined') {
  window.ChefCodeAPI = ChefCodeAPI;
}

// Export per Mobile (React Native / Node.js)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChefCodeAPI;
}

// Export per ES6 modules
if (typeof exports !== 'undefined') {
  exports.ChefCodeAPI = ChefCodeAPI;
}