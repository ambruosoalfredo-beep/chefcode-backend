  // Production tab panels (per visibilità tab solo in production)
  const prodPanels = [
    ...Array.from(document.querySelectorAll('#production-content .production-tabs')),
    ...Array.from(document.querySelectorAll('#production-content .production-tasks-tabbed'))
  ];
/* ChefCode – MVP Controller
   PATCH 1.2.2 — Stable (Inventory deduction + Production fix)
*/

document.addEventListener('DOMContentLoaded', () => {
  // --- INIT ChefCode API ---
  // Forza l'uso del server Render sempre (sia APK che browser web)
  const isAPK = window.location.protocol === 'file:';
  const API_BASE_URL = 'https://chefcode-backend-1.onrender.com';
  
  // API semplificata hardcoded per evitare problemi di import
  const chefCodeAPI = {
    baseURL: API_BASE_URL,
    async sendChatMessage(prompt) {
      const response = await fetch(`${this.baseURL}/api/chatgpt-smart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result;
    },
    async syncData(data) {
      const response = await fetch(`${this.baseURL}/api/sync-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    }
  };

  // Test di connessione al server all'avvio
  async function testServerConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      
      if (!response.ok) {
        console.error('❌ [Test] Server health check failed:', response.status);
      }
    } catch (error) {
      console.error('🚨 [Test] Connection test failed:', error.message);
    }
  }
  
  // Esegui test di connessione
  testServerConnection();

  // --- ChatGPT LLM Chat ---
  const sendBtn = document.getElementById('send-btn');
  const uploadBtn = document.getElementById('upload-btn');
  const voiceChatBtn = document.getElementById('voice-chat-btn');
  const chatgptInput = document.getElementById('chatgpt-input');
  const chatgptResponse = document.getElementById('chatgpt-response');

  // Funzione per inviare messaggio ChatGPT
  const sendChatGPTMessage = async () => {
    const prompt = chatgptInput.value.trim();
    if (!prompt) return;
    chatgptResponse.textContent = 'Loading...';
    try {
      // Usa l'API centralizzata invece della chiamata diretta
      const data = await chefCodeAPI.sendChatMessage(prompt);
      if (data.choices && data.choices[0] && data.choices[0].message) {
        chatgptResponse.textContent = data.choices[0].message.content;
        
        // Se la risposta include dati sincronizzati, aggiorna lo STATE locale
        if (data.syncData) {
          STATE.inventory = data.syncData.inventory || [];
          STATE.recipes = data.syncData.recipes || {};
          STATE.tasks = data.syncData.tasks || [];
          STATE.nextTaskId = data.syncData.nextTaskId || 1;
          
          // Salva nel localStorage (senza ri-sincronizzare con il server)
          save(true);
          
          // Aggiorna la visualizzazione dell'inventario se esiste
          if (typeof renderInventory === 'function') {
            renderInventory();
          }
        }
        
        // Pulisci l'input dopo la risposta
        chatgptInput.value = '';
        // Cancella la risposta dopo 3 secondi per non allargare il footer
        setTimeout(() => {
          chatgptResponse.style.opacity = '0';
          setTimeout(() => {
            chatgptResponse.textContent = '';
            chatgptResponse.style.opacity = '1';
          }, 300);
        }, 3000);
      } else {
        chatgptResponse.textContent = 'No response.';
        // Cancella anche i messaggi di errore dopo 3 secondi
        setTimeout(() => {
          chatgptResponse.style.opacity = '0';
          setTimeout(() => {
            chatgptResponse.textContent = '';
            chatgptResponse.style.opacity = '1';
          }, 300);
        }, 3000);
      }
    } catch (err) {
      chatgptResponse.textContent = 'Error: ' + err.message;
      // Cancella anche i messaggi di errore dopo 3 secondi
      setTimeout(() => {
        chatgptResponse.style.opacity = '0';
        setTimeout(() => {
          chatgptResponse.textContent = '';
          chatgptResponse.style.opacity = '1';
        }, 300);
      }, 3000);
    }
  };

  // Event listeners per i pulsanti
  if (sendBtn && chatgptInput && chatgptResponse) {
    sendBtn.addEventListener('click', sendChatGPTMessage);
    
    // Permetti invio con Enter
    chatgptInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendChatGPTMessage();
      }
    });
  }

  // Pulsante Upload File
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      // Crea un input file nascosto
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*,text/*,.pdf,.doc,.docx';
      fileInput.style.display = 'none';
      
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          chatgptResponse.textContent = `File "${file.name}" selezionato. Funzionalità upload in sviluppo...`;
          setTimeout(() => {
            chatgptResponse.style.opacity = '0';
            setTimeout(() => {
              chatgptResponse.textContent = '';
              chatgptResponse.style.opacity = '1';
            }, 300);
          }, 3000);
        }
      };
      
      document.body.appendChild(fileInput);
      fileInput.click();
      document.body.removeChild(fileInput);
    });
  }

  // Pulsante Voice Chat
  let isVoiceChatRecording = false;
  let voiceChatRecognition;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceChatRecognition = new SpeechRecognition();
    voiceChatRecognition.lang = 'it-IT';
    voiceChatRecognition.continuous = false;
    voiceChatRecognition.interimResults = false;
  }

  if (voiceChatBtn && voiceChatRecognition) {
    voiceChatBtn.addEventListener('click', () => {
      if (!isVoiceChatRecording) {
        // Inizia registrazione
        voiceChatBtn.classList.add('recording');
        voiceChatBtn.title = 'Click to stop recording';
        isVoiceChatRecording = true;
        chatgptResponse.textContent = 'Ascoltando... (clicca per fermare)';
        
        voiceChatRecognition.start();
      } else {
        // Ferma registrazione manualmente
        voiceChatBtn.classList.remove('recording');
        voiceChatBtn.title = 'Voice Message';
        isVoiceChatRecording = false;
        chatgptResponse.textContent = 'Registrazione fermata.';
        voiceChatRecognition.stop();
        
        // Pulisci il messaggio dopo un po'
        setTimeout(() => {
          chatgptResponse.style.opacity = '0';
          setTimeout(() => {
            chatgptResponse.textContent = '';
            chatgptResponse.style.opacity = '1';
          }, 300);
        }, 2000);
      }
    });

    voiceChatRecognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatgptInput.value = transcript;
      chatgptResponse.textContent = `Riconosciuto: "${transcript}"`;
      
      // Invia automaticamente il messaggio
      setTimeout(() => {
        sendChatGPTMessage();
      }, 1000);
    };

    voiceChatRecognition.onend = () => {
      voiceChatBtn.classList.remove('recording');
      voiceChatBtn.title = 'Voice Message';
      isVoiceChatRecording = false;
    };

    voiceChatRecognition.onerror = (event) => {
      voiceChatBtn.classList.remove('recording');
      voiceChatBtn.title = 'Voice Message';
      isVoiceChatRecording = false;
      chatgptResponse.textContent = 'Errore riconoscimento vocale: ' + event.error;
      setTimeout(() => {
        chatgptResponse.style.opacity = '0';
        setTimeout(() => {
          chatgptResponse.textContent = '';
          chatgptResponse.style.opacity = '1';
        }, 300);
      }, 3000);
    };
  }
  // --- Riconoscimento vocale e invio al backend ---
  const voiceBtn = document.getElementById('voice-btn');
  const voiceMicIcon = document.getElementById('voice-mic-icon');
  const voiceResult = document.getElementById('voice-result');
  const voiceStatusLabel = document.getElementById('voice-status-label');
  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.continuous = false;
    recognition.interimResults = false;
  }

  let isListening = false;
  if (voiceBtn && recognition) {
    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        if (voiceStatusLabel) {
          voiceStatusLabel.textContent = 'Recording stopped.';
          setTimeout(() => {
            voiceStatusLabel.textContent = 'Press to speak';
          }, 2000);
        }
        return;
      }
      voiceResult.textContent = '';
      if (voiceStatusLabel) voiceStatusLabel.textContent = 'Listening...';
      if (voiceMicIcon) voiceMicIcon.style.color = 'red';
      recognition.start();
      isListening = true;
    });
    recognition.onend = () => {
      if (voiceMicIcon) voiceMicIcon.style.color = '';
      isListening = false;
      if (voiceStatusLabel) {
        voiceStatusLabel.textContent = 'Recording stopped.';
        setTimeout(() => {
          voiceStatusLabel.textContent = 'Press to speak';
        }, 2000);
      }
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (transcript.length === 0) {
        voiceResult.textContent = 'Nessuna voce rilevata. Riprova.';
        return;
      }
      voiceResult.textContent = 'Testo riconosciuto: ' + transcript;

      // --- PARSER VOCALE AVANZATO ---
      let name = '', quantity = 1, unit = 'pz', category = 'Non specificato', price = 0;
      // Nome: cerca "aggiungi [quantità] [unità] [nome]"
      let match = transcript.match(/(?:aggiungi|add)\s+(\d+(?:[\.,]\d+)?)\s*([a-zA-Z]+)\s+([a-zA-Zàèéìòù'\s]+)/i);
      if (match) {
        quantity = parseFloat(match[1].replace(',', '.'));
        unit = match[2].trim();
        name = match[3].trim();
      } else {
        // Fallback: cerca solo nome dopo "di" o "of"
        let nameMatch = transcript.match(/(?:di|of)\s*([a-zA-Zàèéìòù'\s]+?)(?=\s*(costo|prezzo|euro|€|price|cost|dollars|\$|categoria|category|$))/i);
        if (nameMatch && nameMatch[1]) name = nameMatch[1].trim();
      }
      // Prezzo
      let priceMatch = transcript.match(/(?:costo|prezzo|euro|€|price|cost|dollars|dollari|pounds|sterline|£|\$)\s*(\d+(?:[\.,]\d+)?)/i);
      if (!priceMatch) priceMatch = transcript.match(/(\d+(?:[\.,]\d+)?)\s*(?:costo|prezzo|euro|€|price|cost|dollars|dollari|pounds|sterline|£|\$)/i);
      if (!priceMatch) {
        const euroCentsMatch = transcript.match(/(\d+)\s*(?:euro|dollars|dollari|pounds|sterline)?\s*e\s*(\d+)(?:\s*centesimi|cents|pence)?/i);
        if (euroCentsMatch) price = parseFloat(euroCentsMatch[1]) + parseFloat(euroCentsMatch[2])/100;
      }
      if (priceMatch) price = parseFloat(priceMatch[1].replace(',', '.'));
      // Categoria
      let catMatch = transcript.match(/(?:categoria|category)\s*([a-zA-Zàèéìòù'\s]+)/i);
      if (catMatch && catMatch[1]) category = catMatch[1].trim();

      if (name) {
        addOrMergeInventoryItem({ name, unit, quantity, category, price });
        save();
        if (typeof renderInventory === 'function') renderInventory();
        voiceResult.textContent += `\nIngrediente aggiunto: ${name}, quantità ${quantity}, unità ${unit}, categoria ${category}, prezzo ${price}`;
      } else {
        voiceResult.textContent += '\nFormato non riconosciuto. Pronuncia almeno "nome [nome]".';
      }
    };
    recognition.onerror = (event) => {
      voiceResult.textContent = 'Errore: ' + event.error;
    };
  } else if (voiceBtn) {
    voiceBtn.disabled = true;
    voiceResult.textContent = 'Il riconoscimento vocale non è supportato su questo browser.';
  }
  // ---------- Helpers ----------
  const el = (id) => document.getElementById(id);
  const q  = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function safe(fn){ try { return fn(); } catch(e){ console.warn(e); return undefined; } }

  // ---------- Storage ----------
  const STORAGE_KEY = 'chefcode:v1';
  let STATE = {
    inventory: [],            // [{name, unit, quantity, category, price}]
    recipes: {},              // { "Carbonara": { items:[{name, qty, unit}] } }
    tasks: [],                // [{id, recipe, quantity, assignedTo, status}]
    nextTaskId: 1
  };

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw){
        const parsed = JSON.parse(raw);
        STATE.inventory = Array.isArray(parsed.inventory) ? parsed.inventory : [];
        STATE.recipes   = parsed.recipes && typeof parsed.recipes === 'object' ? parsed.recipes : {};
        STATE.tasks     = Array.isArray(parsed.tasks) ? parsed.tasks : [];
        STATE.nextTaskId= Number(parsed.nextTaskId)||1;
      }
    } catch(e){ console.warn('load error', e); }
  }
  function save(skipSync = false){
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); 
      // Sincronizza con il server per la chat intelligente (solo se non stiamo già sincronizzando)
      if (!skipSync) {
        syncWithServer();
      }
    } catch(e){}
  }
  
  // Sincronizza i dati con il server per permettere alla chat di accedervi
  async function syncWithServer() {
    try {
      // Usa l'API centralizzata invece della chiamata diretta
      await chefCodeAPI.syncData(STATE);
    } catch (err) {
      console.warn('Errore sincronizzazione server:', err);
    }
  }
  
  load();
  // Sincronizza immediatamente al caricamento
  syncWithServer();

  // ---------- Selectors ----------
  const chefcodeLogoBtn = el('chefcode-logo-btn');

  const stepSelectionPage   = el('step-selection-page');
  const inputDetailPage     = el('input-detail-page');
  const inputPagesContainer = el('input-pages-container');
  const bigStepButtons      = qa('.big-step-button[data-step]');

  // Account
  const accountButton         = q('.account-button');
  const accountDropdownContent= q('.account-menu .dropdown-content');

  // Goods In – Camera/OCR (sim)
  const cameraViewfinder = q('.camera-viewfinder');
  const cameraOutput     = q('.camera-output');

  // Goods In – Voice (sim + process)
  const microphoneBtn         = el('microphone-btn');
  const micLabel              = el('mic-label');
  const voiceStatus           = el('voice-status');
  const voiceRecognizedText   = el('voice-recognized-text');
  const recognizedTextContent = el('recognized-text-content');
  const processVoiceBtn       = el('process-voice-btn');

  // Goods In – Manual input
  const manualEntryForm   = el('manual-entry-form');
  const inventoryTableBody= el('inventory-table-body');
  const inventoryTotalVal = el('inventory-total-value');

  // Inventory – search/filter/expand
  const inventorySearch   = el('inventory-search');
  const categoryFilter    = el('inventory-category-filter');
  const expandTableBtn    = el('expand-table-btn');
  const inventoryTableCtr = q('#inventory-page-content .inventory-table-container');

  // Recipe setup
  const ingredientSelect        = el('ingredient-select');
  const ingredientQty           = el('ingredient-qty');
  const ingredientUnit          = el('ingredient-unit');
  const addIngredientBtn        = el('add-ingredient-btn');
  const recipeIngredientsList   = el('recipe-ingredients-list');
  const saveRecipeBtn           = el('save-recipe-btn');
  const recipeNameInput         = el('recipe-name');

  // Production
  const recipeSelectProd  = el('recipe-select-prod');
  const productionQty     = el('production-qty');
  const assignTo          = el('assign-to');
  const initialStatusSelect = el('initial-status');
  const addTaskBtn        = el('add-task-btn');
  const todoTasksContainer      = el('todo-tasks');
  const inprogressTasksContainer= el('inprogress-tasks');
  const completedTasksList      = el('completed-tasks-list');

// === Production state bootstrap (safe) ===
// garantisci che l'array esista sempre e che l'id parta da >0
window.productionTasks = Array.isArray(window.productionTasks) ? window.productionTasks : [];
window.taskIdCounter   = typeof window.taskIdCounter === 'number' ? window.taskIdCounter : 0;

  // runtime temp for recipe building
  let currentRecipeIngredients = [];
  let RECIPES = {};  // mappa: { [recipeName]: { items:[{name, quantity, unit}] } }
    // --- Helpers per unità/nome e parsing ---
     const normUnit = (u) => {
        u = String(u || '').trim().toLowerCase();
         if (u === 'l') u = 'lt';
         if (u === 'gr') u = 'g';
        if (u === 'pz.' || u === 'pcs' || u === 'pc') u = 'pz';
        return u;
     };
     const convertFactor = (from, to) => {
        from = normUnit(from); to = normUnit(to);
        if (from === to) return 1;
         if (from === 'kg' && to === 'g')  return 1000;
        if (from === 'g'  && to === 'kg') return 1/1000;
         if (from === 'lt' && to === 'ml') return 1000;
         if (from === 'ml' && to === 'lt') return 1/1000;
        // MVP: pz <-> bt 1:1
         if ((from === 'pz' && to === 'bt') || (from === 'bt' && to === 'pz')) return 1;
         return null; // non convertibili
    };
     const normName = (s) =>
         String(s || '')
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
          .replace(/[^a-z0-9\s]/g,' ')
           .replace(/\s+/g,' ')
           .trim();
     const parseNumber = (t) => {
        if (!t) return 0;
         t = String(t).replace('€','').replace(/\s/g,'');
         // togli separa-migliaia e usa il punto come decimale
         t = t.replace(/\./g,'').replace(',', '.');
         const n = parseFloat(t);
         return isNaN(n) ? 0 : n;
     };
// ==== Merge Inventory: stesso nome + stesso prezzo => somma quantità ====
// Usa le funzioni già presenti: normName, normUnit, convertFactor
function addOrMergeInventoryItem({ name, unit, quantity, category, price }) {
  const nName = normName(name);
  const pCents = Math.round((Number(price) || 0) * 100);

  // cerca stessa riga: stesso nome normalizzato e stesso prezzo (a centesimi)
  const idx = STATE.inventory.findIndex(it =>
    normName(it.name) === nName &&
    Math.round((Number(it.price) || 0) * 100) === pCents
  );

  if (idx >= 0) {
    const row = STATE.inventory[idx];
    const fromU = normUnit(unit || row.unit);
    const toU   = normUnit(row.unit || fromU);
    const f = convertFactor(fromU, toU);

    if (f === null) {
      // unità non compatibili: NON fondere, crea una nuova riga
      STATE.inventory.push({ name, unit, quantity, category: category || row.category || 'Other', price });
    } else {
      row.quantity = (Number(row.quantity) || 0) + (Number(quantity) || 0) * f;
      // manteniamo categoria e unit della riga esistente
    }
  } else {
    // nuova riga
    STATE.inventory.push({ name, unit, quantity, category, price });
  }
}

  let isRecording = false;
  
  

  // ---------- Routing ----------
  function normalizeToken(s){ return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,''); }

  function findPageIdForStep(stepToken){
    const token = normalizeToken(stepToken);
    // Prova id esatto "<step>-content"
    const direct = `${stepToken}-content`;
    if (el(direct)) return direct;
    // Cerca qualunque .input-page che contenga il token “normalizzato”
    const pages = qa('.input-page');
    for (const page of pages){
      const pid = page.id || '';
      if (normalizeToken(pid).includes(token)) return pid;
    }
    return null;
  }

  function showPage(pageId){
    if (!stepSelectionPage || !inputDetailPage || !inputPagesContainer) return;
    qa('.input-page').forEach(p => p.classList.remove('active'));
    stepSelectionPage.classList.remove('active');
    inputDetailPage.classList.remove('active');
    const target = el(pageId);
    if (target){ target.classList.add('active'); inputDetailPage.classList.add('active'); }
    else { stepSelectionPage.classList.add('active'); }
    // Mostra i tab solo se sei nella pagina production
    prodPanels.forEach(el => {
      el.style.display = (pageId === 'production-content') ? '' : 'none';
    });
  }

  bigStepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-step'); // es: goodsin / goods-in
      const pid  = findPageIdForStep(step || '');
      if (pid) showPage(pid);
      else showPage('step-selection-page');
     /* ==== PATCH LAYOUT-4x2 — pulizia stili inline sul Back (append-only) ==== */
(function enforceHomeGridOnBack(){
  const home = document.getElementById('step-selection-page');
  if (!home) return;
  const grid = home.querySelector('.step-buttons-grid');
  if (!grid) return;

  function cleanInline() {
    // rimuove qualsiasi style inline che possa stringere i riquadri
    grid.removeAttribute('style');
    if (grid.style) {
      grid.style.gridTemplateColumns = '';
      grid.style.gridTemplateRows = '';
      grid.style.gap = '';
    }
  }

  // Dopo qualunque click su un back-button, quando la home è visibile ripulisci
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    const targetId = back.dataset.backTarget || '';
    setTimeout(() => {
      if (targetId === 'step-selection-page' || home.classList.contains('active')) {
        cleanInline(); // il CSS sopra fa il resto (4x2 responsive)
      }
    }, 0);
  }, true);

  // Safety net: se la home diventa active per altri motivi
  const mo = new MutationObserver(() => {
    if (home.classList.contains('active')) cleanInline();
  });
  mo.observe(home, { attributes: true, attributeFilter: ['class'] });
})();
 /* === PATCH 1.1.6 — Forza il centro della dashboard al ritorno (append-only) === */
(function centerHomeGridOnActivate(){
  const home = document.getElementById('step-selection-page');
  const grid = home ? home.querySelector('.step-buttons-grid') : null;
  if (!home || !grid) return;

  function centerNow(){
    // nessuna misura fissa: centratura a contenuto (resta responsive)
    grid.style.width = 'fit-content';
    grid.style.marginLeft = 'auto';
    grid.style.marginRight = 'auto';
    grid.style.justifyContent = 'center';
  }

  // Quando premi "Back" e torni alla home, centra
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    setTimeout(() => {
      if (home.classList.contains('active')) centerNow();
    }, 0);
  }, true);

  // Safety net: qualsiasi volta la home diventa active, centra
  const mo = new MutationObserver(() => {
    if (home.classList.contains('active')) centerNow();
  });
  mo.observe(home, { attributes: true, attributeFilter: ['class'] });
})();

    });
  });

  if (chefcodeLogoBtn){
    chefcodeLogoBtn.addEventListener('click', () => showPage('step-selection-page'));
  }

  // Account menu
  if (accountButton && accountDropdownContent){
    accountButton.addEventListener('click', () => {
      accountDropdownContent.style.display = accountDropdownContent.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', (e) => {
      if (!accountButton.contains(e.target) && !accountDropdownContent.contains(e.target)) {
        accountDropdownContent.style.display = 'none';
      }
    /* ============ PATCH 1.1.3 — Goods In click fix + Back grid 2x4 ============ */
/* SOLO aggiunte, nessuna modifica al tuo codice esistente                     */

// 1) Goods In: cattura in modo robusto i click sui 3 pulsanti interni
(function rebindGoodsInButtons(){
  const goodsInContent = document.getElementById('goods-in-content');
  if (!goodsInContent) return;

  // Usiamo capture=true per intercettare il click anche se ci sono figli (icona/span)
  goodsInContent.addEventListener('click', (e) => {
    const btn = e.target.closest('.big-step-button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    if (!action) return;

    // Mappa azione -> id pagina interna (sono gli ID che hai già in index.html)
    const map = {
      'invoice-photo': 'camera-simulation-page',
      'voice-input'  : 'voice-input-page-content',
      'manual-input' : 'manual-input-content'
    };
    const targetId = map[action];
    if (targetId && typeof showPage === 'function') {
      e.preventDefault();
      showPage(targetId);
    }
  }, true);
})();

// 2) Back: quando torni alla dashboard, forziamo la griglia 2×4 come all’inizio
(function fixBackGrid(){
  // intercettiamo TUTTI i back-button già presenti in pagina
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;

    // Lasciamo che il tuo handler faccia showPage(...). Poi sistemiamo la griglia.
    setTimeout(() => {
      const targetId = back.dataset.backTarget || '';
      // Se torni alla home, rimetti 4 colonne fisse (2 righe x 4)
      if (targetId === 'step-selection-page' || document.getElementById('step-selection-page')?.classList.contains('active')) {
        const grid = document.querySelector('#step-selection-page .step-buttons-grid');
        if (grid) grid.style.gridTemplateColumns = 'repeat(4, 1fr)'; // 2 file da 4 come da origine
      }
    }, 0);
  }, true);
})();

    });
  }

  // ---------- Camera/OCR (sim) ----------
  function renderCameraIdle(){
    if (!cameraViewfinder) return;
    cameraViewfinder.innerHTML = `
      <div class="camera-overlay">
        <div class="camera-guides"></div>
        <div class="camera-guides"></div>
        <div class="camera-guides"></div>
      </div>
      <div class="camera-cta">
        <button id="take-photo-btn" class="camera-btn"><i class="fas fa-camera"></i></button>
      </div>`;
  }
  if (cameraViewfinder){
    renderCameraIdle();
    cameraViewfinder.addEventListener('click', (e) => {
      if (e.target.closest('#take-photo-btn')){
        cameraViewfinder.innerHTML = `
          <div class="camera-shot">
            <img src="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1200&q=80&auto=format&fit=crop" alt="Invoice" />
          </div>
          <div class="camera-cta">
            <button id="retake-photo-btn" class="camera-btn secondary"><i class="fas fa-redo"></i></button>
            <button id="confirm-photo-btn" class="camera-btn primary"><i class="fas fa-check"></i></button>
          </div>`;
      }
      if (e.target.closest('#retake-photo-btn')) renderCameraIdle();
      if (e.target.closest('#confirm-photo-btn') && cameraOutput){
        cameraOutput.innerHTML = `
          <div class="ocr-result">
            <h4>OCR Extraction (simulato)</h4>
            <div class="ocr-lines">
              <div class="ocr-line">"Pomodori Pelati" — 12 bt — €1,20</div>
              <div class="ocr-line">"Guanciale" — 2 kg — €9,50</div>
              <div class="ocr-line">"Uova" — 60 pz — €0,23</div>
            </div>
          </div>`;
      }
    });
  }

  // ---------- Voice (sim + process) ----------
  if (microphoneBtn){
    microphoneBtn.addEventListener('click', () => {
      isRecording = !isRecording;
      if (isRecording){
        if (voiceStatus) voiceStatus.textContent = 'Listening...';
        if (micLabel)    micLabel.textContent = 'Stop Recording';
        setTimeout(() => {
          if (recognizedTextContent) recognizedTextContent.textContent = '"pomodori 20 chili 2 euro e 50"';
          if (voiceRecognizedText)   voiceRecognizedText.style.display = 'block';
        }, 1200);
      } else {
        if (micLabel)              micLabel.textContent = 'Start Recording';
        if (voiceStatus)           voiceStatus.textContent = 'Press the microphone to start speaking...';
        if (voiceRecognizedText)   voiceRecognizedText.style.display = 'none';
        if (recognizedTextContent) recognizedTextContent.textContent = '';
      }
    });
  }

  function parseItalianGoods(text){
    const t = (text||'').toLowerCase().replace(/"/g,' ').replace(/\s+/g,' ').trim();
    // prezzo: "2 euro e 50" | "€2,50"
    let price = 0;
    const pm = t.match(/(\d+[.,]?\d*)\s*(?:€|euro)?(?:\s*e\s*(\d{1,2}))?/);
    if (pm){
      const euros = parseFloat(pm[1].replace(',','.'));
      const cents = pm[2] ? parseInt(pm[2]) : 0;
      price = (isNaN(euros)?0:euros) + (isNaN(cents)?0:cents)/100;
    }
    const unitMap = { chili:'kg', chilo:'kg', chilogrammi:'kg', kg:'kg', grammi:'g', g:'g', litro:'l', litri:'l', lt:'l', l:'l', millilitri:'ml', ml:'ml', pezzi:'pz', pezzo:'pz', uova:'pz', pz:'pz', bt:'bt' };
    const qm = t.match(/(\d+[.,]?\d*)\s*(kg|g|l|lt|ml|pz|bt|litro|litri|chili|chilo|chilogrammi|grammi|millilitri|pezzi|pezzo|uova)\b/);
    const qty  = qm ? parseFloat(qm[1].replace(',','.')) : 1;
    const unit = qm ? (unitMap[qm[2]] || qm[2]) : 'pz';
    const name = qm ? t.slice(0, t.indexOf(qm[0])).trim() : t;
    return { name: name || 'item', qty: isNaN(qty)?1:qty, unit, price: isNaN(price)?0:price };
  }

  if (processVoiceBtn && recognizedTextContent){
    processVoiceBtn.addEventListener('click', () => {
      const text = recognizedTextContent.textContent || '';
      const { name, qty, unit, price } = parseItalianGoods(text);
      if (!name){ alert('Voice: nessun nome articolo rilevato'); return; }
    addOrMergeInventoryItem({ name, unit, quantity: qty, category: 'Other', price });
      save(); renderInventory();
      alert(`Voice→Inventory: ${name} — ${qty} ${unit} @ €${price.toFixed(2)}`);
    });
  }

  // ---------- Inventory ----------
  function rowToItem(tr){
    const tds = tr?.querySelectorAll('td'); if (!tds || tds.length < 6) return null;
    const name = tds[0].textContent.trim();
    const priceText = tds[1].textContent.replace('€','').trim();
    const unit = tds[2].textContent.trim();
    const quantityText = tds[3].textContent.trim();
    const category = tds[4].textContent.trim();
    const price = parseFloat(priceText.replace(',','.')) || 0;
    const quantity = parseFloat(quantityText.replace(',','.')) || 0;
    return { name, unit, quantity, category, price };
  }

  function renderInventory(){
    if (!inventoryTableBody) return;
    inventoryTableBody.innerHTML = '';
    let total = 0;
    STATE.inventory.forEach(item => {
      const rowTotal = (item.price||0) * (item.quantity||0);
      total += rowTotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.name}</td>
        <td>€${(item.price ?? 0).toFixed(2)}</td>
        <td>${item.unit || '-'}</td>
        <td>${item.quantity ?? 0}</td>
        <td>${item.category || '-'}</td>
        <td>€${rowTotal.toFixed(2)}</td>`;
      inventoryTableBody.appendChild(tr);
    });
    if (inventoryTotalVal) inventoryTotalVal.textContent = `€${total.toFixed(2)}`;
    populateIngredientSelect(); // tiene il select aggiornato
  }

  // Bootstrap inventory: importa dal DOM la prima volta se STATE è vuoto
  if (inventoryTableBody){
    if (STATE.inventory.length === 0){
      const rows = qa('#inventory-table-body tr');
      if (rows.length) {
        STATE.inventory = rows.map(rowToItem).filter(Boolean);
        save();
      }
    }
    renderInventory();
  }

  // Manual Input (sovrascrive submit per evitare doppie append)
  if (manualEntryForm){
    manualEntryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (el('item-name')?.value || '').trim();
      const qty  = parseFloat(el('item-quantity')?.value || '0');
      const unit = el('item-unit')?.value || 'pz';
      const price= parseFloat(el('item-price')?.value || '0');
      const cat  = el('item-category')?.value || 'Other';
      if (!name || isNaN(qty) || isNaN(price)){ alert('Inserisci nome, quantità e prezzo validi.'); return; }
      addOrMergeInventoryItem({ name, unit, quantity: qty, category: cat, price });
      save(); renderInventory();
      safe(()=>manualEntryForm.reset());
      safe(()=>el('item-name').focus());
      alert(`"${name}" aggiunto in inventario`);
    });
  }

  // Search / Filter
  function applyInventoryFilters(){
    if (!inventoryTableBody) return;
    const term = (inventorySearch?.value || '').toLowerCase();
    const cat  = (categoryFilter?.value || 'All');
    let total = 0;
    qa('#inventory-table-body tr').forEach(row => {
      const name = row.children[0]?.textContent.toLowerCase() || '';
      const rc   = row.children[4]?.textContent || '';
      const isAll = cat.toLowerCase() === 'all';
      const ok   = (!term || name.includes(term)) && (isAll || cat === '' || rc === cat);
      row.style.display = ok ? '' : 'none';
      if (ok){
        const tv = row.children[5]?.textContent.replace('€','').trim();
        const val= parseFloat(tv?.replace('.','').replace(',','.')) || 0;
        total += val;
      }
    });
    if (inventoryTotalVal) inventoryTotalVal.textContent = `€${total.toFixed(2)}`;
  }
  if (inventorySearch) inventorySearch.addEventListener('input', applyInventoryFilters);
  if (categoryFilter)  categoryFilter.addEventListener('change', applyInventoryFilters);
  if (expandTableBtn && inventoryTableCtr){
    expandTableBtn.addEventListener('click', () => inventoryTableCtr.classList.toggle('expanded'));
  }

  // ---------- Recipes ----------
  function renderIngredientsList(){
    if (!recipeIngredientsList) return;
    recipeIngredientsList.innerHTML = '';
    currentRecipeIngredients.forEach((ing, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${ing.name} - ${ing.quantity} ${ing.unit}</span>
                      <button class="remove-ingredient-btn" data-index="${i}">&times;</button>`;
      recipeIngredientsList.appendChild(li);
    });
  }

  function populateIngredientSelect(){
    if (!ingredientSelect) return;
    const current = ingredientSelect.value;
    ingredientSelect.innerHTML = `<option value="" disabled selected>-- choose item --</option>`;
    const seen = new Set();
    STATE.inventory.forEach(it => {
      if (seen.has(it.name)) return;
      seen.add(it.name);
      const opt = document.createElement('option');
      opt.value = it.name; opt.textContent = it.name;
      ingredientSelect.appendChild(opt);
    });
    if (current && seen.has(current)) ingredientSelect.value = current;
    updateRecipeSelects(); // mantiene in sync Produzione
  }

  if (addIngredientBtn){
    addIngredientBtn.addEventListener('click', () => {
      const name = ingredientSelect?.value || '';
      const qty  = parseFloat(ingredientQty?.value || '0');
      const unit = ingredientUnit?.value || 'g';
      if (!name || !qty){ alert('Seleziona ingrediente e quantità.'); return; }
      currentRecipeIngredients.push({ name, quantity: qty, unit });
      renderIngredientsList();
      if (ingredientSelect) ingredientSelect.value = '';
      if (ingredientQty)    ingredientQty.value = '';
    });
  }

  if (recipeIngredientsList){
    recipeIngredientsList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-ingredient-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.index, 10);
      if (!isNaN(idx)) currentRecipeIngredients.splice(idx, 1);
      renderIngredientsList();
    });
  }

  function updateRecipeSelects(){
    if (!recipeSelectProd) return;
    const current = recipeSelectProd.value;
    recipeSelectProd.innerHTML = '<option value="" disabled selected>-- Choose a recipe --</option>';
    Object.keys(STATE.recipes).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      recipeSelectProd.appendChild(opt);
    });
    if (STATE.recipes[current]) recipeSelectProd.value = current;
  }
    if (saveRecipeBtn) {
  saveRecipeBtn.addEventListener('click', () => {
    const recipeName = (document.getElementById('recipe-name')?.value || '').trim();
    if (!recipeName) { alert('Please enter a name for the recipe.'); return; }
    if (!currentRecipeIngredients.length) { alert('Please add at least one ingredient.'); return; }

    // Salva nel motore usato dalla Production: STATE.recipes
    // e usa il campo "qty" (non "quantity") perché la deduzione legge ing.qty
    STATE.recipes[recipeName] = {
      items: currentRecipeIngredients.map(i => ({
        name: i.name,
        qty:  parseFloat(i.quantity) || 0, // quantità per 1 batch
        unit: i.unit
      }))
    };
    save();

    // Aggiorna il menu a tendina in Production
    updateRecipeSelects();

    // Feedback
    let summary = `Recipe Saved: ${recipeName}\n\nIngredients:\n`;
    STATE.recipes[recipeName].items.forEach(ing => {
      summary += `- ${ing.name}: ${ing.qty} ${ing.unit}\n`;
    });
    alert(summary);

    // Reset form ricetta
    currentRecipeIngredients = [];
    renderIngredientsList();
    const rn = document.getElementById('recipe-name'); if (rn) rn.value = '';
    const ri = document.getElementById('recipe-instructions'); if (ri) ri.value = '';
    if (ingredientSelect) ingredientSelect.value = '';
    if (ingredientQty) ingredientQty.value = '';
  });
}
   
  // Primo allineamento selects
  populateIngredientSelect();
  updateRecipeSelects();

// ---------- Production ----------
  const renderProductionTasks = () => {
    if (!todoTasksContainer || !completedTasksList) return;
    // Tab To Do
    todoTasksContainer.innerHTML = '<h4 class="tab-title">To Do</h4>';
    // Tab Completed
    completedTasksList.innerHTML = '<h4 class="tab-title">Completed</h4>';
    window.productionTasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';
      card.dataset.id = String(task.id);
      card.innerHTML = `
        <h5>${task.recipe} (${task.quantity})</h5>
        <p>Assegnato a: ${task.assignedTo || '—'}</p>
        <div class="task-card-footer">
          ${task.status === 'todo' ? '<button class="task-action-btn" type="button">Convalida</button>' : '<span class="task-completed-label">Completata</span>'}
        </div>
      `;
      if (task.status === 'todo') {
        todoTasksContainer.appendChild(card);
      } else if (task.status === 'completed') {
        completedTasksList.appendChild(card);
      }
    });
  };


// ==== Helpers per deduzione inventario (unità + nomi) ====
function ccNormUnit(u){
  u = String(u || '').trim().toLowerCase();
  if (u === 'l') u = 'lt';
  if (u === 'gr') u = 'g';
  if (u === 'pcs' || u === 'pc' || u === 'pz.') u = 'pz';
  return u;
}
function ccConvertFactor(from, to){
  from = ccNormUnit(from); to = ccNormUnit(to);
  if (from === to) return 1;
  if (from === 'kg' && to === 'g') return 1000;
  if (from === 'g'  && to === 'kg') return 1/1000;
  if (from === 'lt' && to === 'ml') return 1000;
  if (from === 'ml' && to === 'lt') return 1/1000;
  // equivalenza “di comodo” se tratti bottle/pezzi come unità contabili
  if ((from === 'pz' && to === 'bt') || (from === 'bt' && to === 'pz')) return 1;
  return null; // incompatibili
}
function ccNormName(s){ return String(s || '').trim().toLowerCase(); }
function ccFindInventoryItemByName(name){
  const wanted = ccNormName(name);
  return STATE.inventory.find(it => ccNormName(it.name) === wanted) || null;
}

 function consumeInventoryForTask(task){
  const r = STATE.recipes[task.recipe];
  if (!r){ alert(`Ricetta non trovata: ${task.recipe}`); return; }

  const batches = Number(task.quantity) || 1; // quante “unità ricetta” produci
  let changed = false;
  const skipped = [];

  r.items.forEach(ing => {
    const inv = ccFindInventoryItemByName(ing.name);
    if (!inv){ skipped.push(`${ing.name} (non in inventario)`); return; }

    const invU = ccNormUnit(inv.unit);
    const ingU = ccNormUnit(ing.unit || invU);
    const f = ccConvertFactor(ingU, invU);
    if (f === null){ skipped.push(`${ing.name} (${ingU}→${invU} incompatibile)`); return; }

    const perBatch = Number(ing.qty) || 0;
    const toConsume = perBatch * batches * f;

    inv.quantity = Math.max(0, (Number(inv.quantity) || 0) - toConsume);
    changed = true;
  });

  if (changed){ save(); renderInventory(); }
  if (skipped.length){ console.warn('Ingredienti non scalati:', skipped); }
}


  function onTaskActionClick(e){
    const btn = e.target.closest('.task-action-btn');
    if (!btn) return;
    const card = btn.closest('.task-card'); if (!card) return;
    const id = Number(card.dataset.id);
    const task = STATE.tasks.find(t => t.id === id);
    if (!task) return;
    if (task.status === 'todo'){ task.status = 'inprogress'; }
    else if (task.status === 'inprogress'){ task.status = 'completed'; consumeInventoryForTask(task); }
    save(); renderProductionTasks();
  }

  if (addTaskBtn) {
  // evita comportamenti da "submit" nel caso in cui il bottone fosse dentro un form
  addTaskBtn.setAttribute('type','button');

    addTaskBtn.addEventListener('click', (e) => {
    e.preventDefault();

    const recipe = recipeSelectProd && recipeSelectProd.value;
    const quantity = productionQty && productionQty.value;
    const assignedToVal = assignTo && assignTo.value;
    const initialStatus = (initialStatusSelect && initialStatusSelect.value) || 'todo';

    if (!recipe || !quantity) {
      alert('Please select a recipe and specify the quantity.');
      return;
    }

    window.taskIdCounter += 1;
    const newTask = {
      id: window.taskIdCounter,
      recipe,
      quantity: Number(quantity),
      assignedTo: assignedToVal || '',
      status: (initialStatus === 'completed') ? 'completed' : 'todo'
      
    };
// Se l'utente ha scelto "Completed", scala subito l'inventario
if (initialStatus === 'completed') {
  try {
    consumeInventoryForTask(newTask);
  } catch (e) {
    console.warn('consume-on-create failed', e);
  }
}
3
    window.productionTasks.push(newTask);
    renderProductionTasks();

    if (productionQty) productionQty.value = '';
    if (recipeSelectProd) recipeSelectProd.value = '';
    if (initialStatusSelect) initialStatusSelect.value = 'todo';
  });

}


// Gestione click su To Do: convalida task
if (todoTasksContainer) {
  todoTasksContainer.addEventListener('click', function(event) {
    const btn = event.target.closest('button.task-action-btn');
    if (!btn) return;
    const card = btn.closest('.task-card');
    const taskId = parseInt(card.dataset.id, 10);
    const task = window.productionTasks.find(t => t.id === taskId);
    if (!task) return;
    // Deduzione ingredienti SOLO ora
    try { consumeInventoryForTask(task); } catch(e){}
    task.status = 'completed';
    renderProductionTasks();
  });
}

// Tab switching logic
if (typeof prodTabBtns !== 'undefined' && prodTabBtns.length) {
  prodTabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      prodTabBtns.forEach(b => b.classList.remove('active'));
      prodTabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'todo') {
        todoTasksContainer.classList.add('active');
      } else if (tab === 'completed') {
        completedTasksList.classList.add('active');
      }
    });
  });
}

 // Inizializza tasks view e riallinea contatore
try {
  const maxExisting = STATE.tasks.reduce((m, t) => {
    const id = Number(t?.id) || 0;
    return id > m ? id : m;
  }, 0);
  const current = Number(STATE.nextTaskId) || 1;
  STATE.nextTaskId = Math.max(current, maxExisting + 1);
} catch (e) {
  console.warn('Reindex nextTaskId failed', e);
  STATE.nextTaskId = Number(STATE.nextTaskId) || 1;
}

  renderProductionTasks();

  // ---------- Back buttons ----------
  qa('.back-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.backTarget || 'step-selection-page';
      showPage(target);
    });
  });

  // ---------- Dev reset ----------
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && String(e.key).toLowerCase() === 'r'){
      if (confirm('Reset ChefCode data?')){
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    }
  });
});
/* ===== CHEFCODE PATCH BACK-RESTORE 1.0 — START ===== */
(function(){
  const home = document.getElementById('step-selection-page');
  const inputDetail = document.getElementById('input-detail-page');
  const homeGrid = home ? home.querySelector('.step-buttons-grid') : null;
  if (!home || !inputDetail || !homeGrid) return;

  // Snapshot dello stato iniziale (quello giusto che vedi all'apertura)
  const ORIGINAL_CLASS = homeGrid.className;
  const HAD_STYLE = homeGrid.hasAttribute('style');
  const ORIGINAL_STYLE = homeGrid.getAttribute('style');

  function restoreHome(){
    // 1) Mostra la home, nascondi area dettagli e qualsiasi sotto-pagina ancora attiva
    document.querySelectorAll('#input-pages-container .input-page.active')
      .forEach(p => p.classList.remove('active'));
    inputDetail.classList.remove('active');
    home.classList.add('active');

    // 2) Ripristina la griglia ESATTAMENTE come all'avvio
    homeGrid.className = ORIGINAL_CLASS;
    if (HAD_STYLE) {
      homeGrid.setAttribute('style', ORIGINAL_STYLE || '');
    } else {
      homeGrid.removeAttribute('style');
    }
    // 3) Pulisci eventuali proprietà inline appiccicate da patch vecchie
    if (homeGrid.style) {
      [
        'grid-template-columns','grid-template-rows','width',
        'margin-left','margin-right','left','right','transform',
        'justify-content','max-width'
      ].forEach(prop => homeGrid.style.removeProperty(prop));
    }
  }

  // Intercetta TUTTI i "Back" e, dopo che i tuoi handler hanno girato, ripristina la home
  document.addEventListener('click', (e) => {
    const back = e.target.closest('.back-button');
    if (!back) return;
    setTimeout(() => {
      const targetId = back.getAttribute('data-back-target') || '';
      if (targetId === 'step-selection-page') restoreHome();
    }, 0);
  }, true);
  /* ===== CHEFCODE PATCH HOME-RESTORE 1.0 — START ===== */
(function(){
  const home = document.getElementById('step-selection-page');
  const inputDetail = document.getElementById('input-detail-page');
  const grid = home ? home.querySelector('.step-buttons-grid') : null;
  const homeBtn = document.getElementById('chefcode-logo-btn');
  if (!home || !inputDetail || !grid || !homeBtn) return;

  // Prendiamo uno snapshot della griglia com'è all'apertura (stato "buono")
  const ORIGINAL_CLASS = grid.className;
  const HAD_STYLE = grid.hasAttribute('style');
  const ORIGINAL_STYLE = grid.getAttribute('style');

  function cleanGridToInitial(){
    // Classi originali
    grid.className = ORIGINAL_CLASS;

    // Stile inline: se all’inizio non c’era, lo togliamo; altrimenti rimettiamo il valore originale
    if (HAD_STYLE) grid.setAttribute('style', ORIGINAL_STYLE || '');
    else grid.removeAttribute('style');

    // Rimuovi qualsiasi proprietà inline residua che possa decentrarla o rimpicciolirla
    if (grid.style){
      [
        'grid-template-columns','grid-template-rows','width','max-width',
        'margin-left','margin-right','left','right','transform','justify-content'
      ].forEach(p => grid.style.removeProperty(p));
    }
  }

  function restoreHome(){
    // Chiudi eventuali sotto-pagine attive
    document.querySelectorAll('#input-pages-container .input-page.active')
      .forEach(p => p.classList.remove('active'));
    inputDetail.classList.remove('active');
    home.classList.add('active');

    // Ripristina la griglia allo stato iniziale (come al primo load)
    cleanGridToInitial();
  }

  // Quando clicchi la "casetta", lasciamo agire il tuo handler e poi ripristiniamo (come fatto per il Back)
  homeBtn.addEventListener('click', () => {
    setTimeout(restoreHome, 0);
  }, true);
})();

})();
window.CHEFCODE_RESET = () => { localStorage.removeItem('chefcode:v1'); alert('ChefCode storage azzerato'); location.reload(); };
