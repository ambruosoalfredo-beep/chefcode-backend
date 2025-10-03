/**
 * ChefCode API Layer - Condiviso tra Web e Mobile
 * Gestisce tutte le chiamate al backend
 */

class ChefCodeAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Configurazione per mobile (React Native / Flutter)
  setMobileConfig(config) {
    this.baseURL = config.baseURL || this.baseURL;
    this.token = config.token; // Per autenticazione future
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