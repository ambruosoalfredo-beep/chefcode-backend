/**
 * ChefCode Utility Functions - Condivise tra Web e Mobile
 */

// ===== STORAGE UTILS =====
export const storage = {
  // Chiave principale per localStorage/AsyncStorage
  key: 'chefcode:v1',
  
  // Salva dati (Web: localStorage, Mobile: AsyncStorage)
  async save(data) {
    try {
      const serialized = JSON.stringify(data);
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web
        localStorage.setItem(this.key, serialized);
      } else if (typeof AsyncStorage !== 'undefined') {
        // React Native
        await AsyncStorage.setItem(this.key, serialized);
      }
      return true;
    } catch (error) {
      console.error('Errore salvataggio:', error);
      return false;
    }
  },
  
  // Carica dati
  async load() {
    try {
      let data = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web
        data = localStorage.getItem(this.key);
      } else if (typeof AsyncStorage !== 'undefined') {
        // React Native
        data = await AsyncStorage.getItem(this.key);
      }
      
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Errore caricamento:', error);
      return null;
    }
  },
  
  // Reset completo
  async reset() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Web
        localStorage.removeItem(this.key);
      } else if (typeof AsyncStorage !== 'undefined') {
        // React Native
        await AsyncStorage.removeItem(this.key);
      }
      return true;
    } catch (error) {
      console.error('Errore reset:', error);
      return false;
    }
  }
};

// ===== PARSING UTILS =====
export const parser = {
  // Parse comando vocale italiano (funziona per web e mobile)
  parseItalianCommand(text) {
    const lowerPrompt = text.toLowerCase();
    console.log('🔍 Parsing comando:', lowerPrompt);
    
    // Rimuovi "aggiungi" dall'inizio
    const cleanPrompt = lowerPrompt.replace(/^aggiungi\s+/, '').trim();
    
    // Trova prezzo con valute
    const currencyPattern = /(€|\$|euro|dollaro|usd|eur)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(€|\$|euro|dollaro|usd|eur)/g;
    let price = 0;
    let priceMatch;
    
    while ((priceMatch = currencyPattern.exec(cleanPrompt)) !== null) {
      const priceValue = priceMatch[2] || priceMatch[3];
      if (priceValue) {
        price = parseFloat(priceValue.replace(',', '.'));
        break;
      }
    }
    
    // Rimuovi prezzo dal prompt
    let promptWithoutPrice = cleanPrompt.replace(currencyPattern, '').trim();
    
    // Trova quantità + unità
    let quantity = 0;
    let unit = 'pz';
    
    const qtyUnitMatch = promptWithoutPrice.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|grammi|kilogrammi|lt|l|litri|ml|millilitri|pz|pezzi|pcs|confezioni|bottiglie|lattine)/);
    if (qtyUnitMatch) {
      quantity = parseFloat(qtyUnitMatch[1].replace(',', '.'));
      unit = qtyUnitMatch[2];
      promptWithoutPrice = promptWithoutPrice.replace(qtyUnitMatch[0], '').trim();
    } else {
      const qtyMatch = promptWithoutPrice.match(/^(\d+(?:[.,]\d+)?)\s+/);
      if (qtyMatch) {
        quantity = parseFloat(qtyMatch[1].replace(',', '.'));
        promptWithoutPrice = promptWithoutPrice.replace(qtyMatch[0], '').trim();
      }
    }
    
    // Nome (rimuovi articoli)
    let name = promptWithoutPrice
      .replace(/^(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, '')
      .replace(/\s+(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, ' ')
      .trim();
    
    return { quantity, unit, name, price };
  },
  
  // Normalizza unità di misura
  normalizeUnit(unit) {
    const unitMap = {
      'chili': 'kg', 'chilo': 'kg', 'chilogrammi': 'kg',
      'grammi': 'g', 'gr': 'g',
      'litro': 'l', 'litri': 'l', 'lt': 'l',
      'millilitri': 'ml', 'ml': 'ml',
      'pezzi': 'pz', 'pezzo': 'pz', 'pcs': 'pz',
      'bottiglie': 'bt', 'bottiglia': 'bt'
    };
    
    return unitMap[unit.toLowerCase()] || unit;
  }
};

// ===== VALIDATION UTILS =====
export const validator = {
  // Valida ingrediente
  validateIngredient(item) {
    const errors = [];
    
    if (!item.name || item.name.trim().length === 0) {
      errors.push('Nome ingrediente richiesto');
    }
    
    if (!item.quantity || item.quantity <= 0) {
      errors.push('Quantità deve essere maggiore di 0');
    }
    
    if (!item.unit || item.unit.trim().length === 0) {
      errors.push('Unità di misura richiesta');
    }
    
    if (item.price < 0) {
      errors.push('Prezzo non può essere negativo');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  // Valida ricetta
  validateRecipe(recipe) {
    const errors = [];
    
    if (!recipe.name || recipe.name.trim().length === 0) {
      errors.push('Nome ricetta richiesto');
    }
    
    if (!recipe.items || !Array.isArray(recipe.items) || recipe.items.length === 0) {
      errors.push('Ricetta deve avere almeno un ingrediente');
    }
    
    recipe.items?.forEach((item, index) => {
      const itemValidation = this.validateIngredient(item);
      if (!itemValidation.isValid) {
        errors.push(`Ingrediente ${index + 1}: ${itemValidation.errors.join(', ')}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// ===== FORMAT UTILS =====
export const formatter = {
  // Formatta prezzo
  currency(amount, currency = '€') {
    return `${currency}${parseFloat(amount || 0).toFixed(2)}`;
  },
  
  // Formatta data
  date(date) {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },
  
  // Formatta quantità
  quantity(qty, unit) {
    return `${parseFloat(qty || 0)} ${unit || 'pz'}`;
  }
};

// ===== DEVICE UTILS =====
export const device = {
  // Rileva piattaforma
  isMobile() {
    return typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);
  },
  
  isWeb() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },
  
  isReactNative() {
    return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  },
  
  // Info piattaforma
  getPlatform() {
    if (this.isReactNative()) return 'react-native';
    if (this.isMobile()) return 'mobile-web';
    if (this.isWeb()) return 'web';
    return 'unknown';
  }
};

// Export legacy per browser
if (typeof window !== 'undefined') {
  window.ChefCodeUtils = { storage, parser, validator, formatter, device };
}