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
    // Fallback per browser
    config = { getApiUrl: () => 'http://localhost:3000' };
  }
} catch (e) {
  // Fallback se config non è disponibile
  config = { getApiUrl: () => 'http://localhost:3000' };
}

class ChefCodeAPI {
  constructor(baseURL = null) {
    // Usa la configurazione dinamica se disponibile
    this.baseURL = baseURL || (config ? config.getApiUrl() : 'http://localhost:3000');
    this.timeout = config?.mobile?.timeout || 10000;
    this.retryAttempts = config?.mobile?.retryAttempts || 3;
    this.retryDelay = config?.mobile?.retryDelay || 1000;
    
    if (config?.debug?.enableLogging) {
      console.log('🌐 ChefCode API initialized with URL:', this.baseURL);
    }
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
      const response = await fetch(`${this.baseURL}/api/chatgpt-smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'Authorization': `Bearer ${this.token}` })
        },
        body: JSON.stringify({ prompt })
      });
      return await response.json();
    } catch (error) {
      console.error('Errore ChatGPT:', error);
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