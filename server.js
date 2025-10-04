require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();

// Middleware di base
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurazione CORS migliorata per produzione
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'https://ambruosoalfredo-beep.github.io',
    'https://chefcode-app.netlify.app',
    'https://chefcode-frontend.onrender.com'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*'); // Fallback per sviluppo
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Verifica che l'API key sia configurata
if (!OPENAI_API_KEY) {
  console.error('❌ ERRORE: OPENAI_API_KEY non configurata!');
  console.error('💡 Su Render: vai su Dashboard > Environment > aggiungi OPENAI_API_KEY');
  console.error('💡 Localmente: crea file .env con OPENAI_API_KEY=la_tua_key');
  process.exit(1);
}

console.log('✅ API Key OpenAI configurata correttamente');

// Health check endpoint per Render
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ChefCode Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    ai_ready: !!OPENAI_API_KEY
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Storage per i dati dell'applicazione (sincronizzato dal frontend)
let appData = {
  inventory: [],
  recipes: {},
  tasks: []
};

// Endpoint per ricevere i dati dell'applicazione
app.post('/api/sync-data', (req, res) => {
  appData = req.body;
  console.log('Dati applicazione sincronizzati:', Object.keys(appData));
  res.json({ success: true });
});

// Endpoint per ottenere i dati dell'applicazione
app.get('/api/data', (req, res) => {
  res.json(appData);
});

// Endpoint per eseguire azioni sull'applicazione
app.post('/api/action', (req, res) => {
  const { action, data } = req.body;
  console.log('Azione richiesta:', action, data);
  
  switch (action) {
    case 'add-inventory':
      appData.inventory.push(data);
      break;
    case 'update-inventory':
      const index = appData.inventory.findIndex(item => item.name === data.name);
      if (index !== -1) {
        appData.inventory[index] = { ...appData.inventory[index], ...data };
      }
      break;
    case 'remove-inventory':
      appData.inventory = appData.inventory.filter(item => item.name !== data.name);
      break;
    default:
      return res.status(400).json({ error: 'Azione non riconosciuta' });
  }
  
  res.json({ success: true, data: appData });
});

// Endpoint intelligente per chat con interpretazione comandi
app.post('/api/chatgpt-smart', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('Richiesta intelligente:', prompt);
  
  // Prima verifica se è un comando che può essere eseguito
  const commandResult = await tryExecuteCommand(prompt);
  if (commandResult.executed) {
    const response = {
      choices: [{
        message: {
          content: commandResult.response
        }
      }]
    };
    
    // Se il comando ha modificato i dati, includi i nuovi dati nella risposta
    if (commandResult.shouldSync) {
      response.syncData = commandResult.newData;
    }
    
    return res.json(response);
  }
  
  // Altrimenti usa ChatGPT con il contesto completo
  const inventoryContext = appData.inventory.length > 0 
    ? `Inventario attuale: ${appData.inventory.map(item => `${item.name} (${item.quantity} ${item.unit}, €${item.price})`).join(', ')}`
    : 'Inventario vuoto';
    
  const recipesContext = Object.keys(appData.recipes).length > 0
    ? `Ricette disponibili: ${Object.keys(appData.recipes).join(', ')}`
    : 'Nessuna ricetta configurata';
    
  const systemPrompt = `Sei l'assistente intelligente di ChefCode, una piattaforma di gestione ristorante.
  
Oggi è ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

STATO ATTUALE:
${inventoryContext}
${recipesContext}

CAPACITÀ:
- Suggerire ricette basate sull'inventario disponibile
- Calcolare costi delle ricette
- Aiutare con la pianificazione della produzione
- Consigliare acquisti per completare ricette
- Analizzare la profittabilità dei piatti

Rispondi sempre in italiano, sii pratico e utile per un ambiente di ristorazione professionale.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 250
      })
    });
    
    const data = await response.json();
    
    if (data.error) {
      console.log('Errore OpenAI:', data.error);
      res.status(400).json({ error: data.error.message });
      return;
    }
    
    res.json(data);
  } catch (err) {
    console.log('Errore nella richiesta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Funzione smart per parsing ingredienti con logica intelligente
function parseIngredientCommand(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  console.log('🔍 Analizzando prompt:', lowerPrompt);
  
  // Rimuovi "aggiungi" dall'inizio
  const cleanPrompt = lowerPrompt.replace(/^aggiungi\s+/, '').trim();
  console.log('🧹 Prompt pulito:', cleanPrompt);
  
  // Trova tutte le valute (€, $, dollaro, euro, ecc.)
  const currencyPattern = /(€|\$|euro|dollaro|usd|eur)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(€|\$|euro|dollaro|usd|eur)/g;
  let price = 0;
  let priceMatch;
  
  while ((priceMatch = currencyPattern.exec(cleanPrompt)) !== null) {
    // Se valuta è prima del numero: gruppo 1 (valuta) e gruppo 2 (numero)
    // Se valuta è dopo il numero: gruppo 3 (numero) e gruppo 4 (valuta)
    const priceValue = priceMatch[2] || priceMatch[3];
    if (priceValue) {
      price = parseFloat(priceValue.replace(',', '.'));
      console.log('💰 Prezzo trovato:', price, priceMatch[1] || priceMatch[4]);
      break;
    }
  }
  
  // Rimuovi la parte del prezzo dal prompt
  let promptWithoutPrice = cleanPrompt.replace(currencyPattern, '').trim();
  console.log('📝 Prompt senza prezzo:', promptWithoutPrice);
  
  // Trova quantità + unità di misura
  const unitsPattern = /(kg|g|grammi|kilogrammi|lt|l|litri|ml|millilitri|pz|pezzi|pcs|confezioni|bottiglie|lattine)\s+/g;
  let quantity = 0;
  let unit = 'pz';
  
  // Cerca pattern: numero + unità
  const qtyUnitMatch = promptWithoutPrice.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|grammi|kilogrammi|lt|l|litri|ml|millilitri|pz|pezzi|pcs|confezioni|bottiglie|lattine)/);
  if (qtyUnitMatch) {
    quantity = parseFloat(qtyUnitMatch[1].replace(',', '.'));
    unit = qtyUnitMatch[2];
    console.log('📊 Quantità e unità:', quantity, unit);
    
    // Rimuovi quantità e unità dal prompt
    promptWithoutPrice = promptWithoutPrice.replace(qtyUnitMatch[0], '').trim();
  } else {
    // Se non trova unità, cerca solo numero all'inizio
    const qtyMatch = promptWithoutPrice.match(/^(\d+(?:[.,]\d+)?)\s+/);
    if (qtyMatch) {
      quantity = parseFloat(qtyMatch[1].replace(',', '.'));
      promptWithoutPrice = promptWithoutPrice.replace(qtyMatch[0], '').trim();
      console.log('📊 Solo quantità trovata:', quantity);
    }
  }
  
  // Quello che rimane è il nome (rimuovi articoli)
  let name = promptWithoutPrice
    .replace(/^(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, '') // Rimuovi articoli all'inizio
    .replace(/\s+(di|del|della|dei|degli|delle|il|la|lo|gli|le|un|una|uno)\s+/g, ' ') // Rimuovi articoli in mezzo
    .trim();
  
  console.log('🏷️ Nome finale:', name);
  
  return { quantity, unit, name, price };
}

// Funzione per interpretare ed eseguire comandi
async function tryExecuteCommand(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Controlla se è un comando "aggiungi"
  if (lowerPrompt.startsWith('aggiungi ')) {
    const parsed = parseIngredientCommand(prompt);
    console.log('✅ Parsing risultato:', parsed);
    
    if (!parsed.name) {
      console.log('❌ Nome ingrediente non trovato');
      return {
        executed: true,
        response: '❌ Non ho capito quale ingrediente vuoi aggiungere. Prova con: "Aggiungi 2 kg di pasta a 3€"'
      };
    }
    
    if (parsed.quantity <= 0) {
      console.log('❌ Quantità non valida');
      return {
        executed: true,
        response: '❌ Specifica una quantità valida. Esempio: "Aggiungi 2 kg di pasta"'
      };
    }
    
    const newItem = {
      name: parsed.name,
      quantity: parsed.quantity,
      unit: parsed.unit,
      category: 'Aggiunto via chat',
      price: parsed.price
    };
    
    console.log('➕ Aggiungendo al server inventory:', newItem);
    appData.inventory.push(newItem);
    
    const responseMessage = parsed.price > 0 
      ? `✅ Ho aggiunto ${parsed.quantity} ${parsed.unit} di ${parsed.name} all'inventario al prezzo di €${parsed.price}!`
      : `✅ Ho aggiunto ${parsed.quantity} ${parsed.unit} di ${parsed.name} all'inventario! Puoi impostare il prezzo più tardi dalla sezione Goods In.`;
    
    console.log('📤 Preparando risposta con shouldSync=true');
    return {
      executed: true,
      response: responseMessage,
      shouldSync: true,
      newData: appData
    };
  }
  
  // Comando: cosa posso cucinare
  if (lowerPrompt.includes('cosa posso cucinare') || lowerPrompt.includes('che posso cucinare')) {
    if (appData.inventory.length === 0) {
      return {
        executed: true,
        response: `🤷‍♂️ L'inventario è vuoto! Aggiungi prima alcuni ingredienti per ricevere suggerimenti di ricette.`
      };
    }
    
    const ingredients = appData.inventory.map(item => item.name).join(', ');
    return {
      executed: true,
      response: `🍳 Con gli ingredienti disponibili (${ingredients}) posso suggerirti alcune ricette! Se hai configurato ricette specifiche in "Recipe Set-Up", posso anche calcolare i costi esatti.`
    };
  }
  
  return { executed: false };
}

app.post('/api/chatgpt', async (req, res) => {
  const prompt = req.body.prompt;
  console.log('Ricevuta richiesta:', prompt);
  
  // Prepara il contesto dell'applicazione
  const inventoryContext = appData.inventory.length > 0 
    ? `Inventario attuale: ${appData.inventory.map(item => `${item.name} (${item.quantity} ${item.unit}, €${item.price})`).join(', ')}`
    : 'Inventario vuoto';
    
  const recipesContext = Object.keys(appData.recipes).length > 0
    ? `Ricette disponibili: ${Object.keys(appData.recipes).join(', ')}`
    : 'Nessuna ricetta configurata';
    
  const systemPrompt = `Sei l'assistente intelligente di ChefCode, una piattaforma di gestione ristorante.
  
Oggi è ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.

STATO ATTUALE:
${inventoryContext}
${recipesContext}

CAPACITÀ:
- Suggerire ricette basate sull'inventario
- Calcolare costi delle ricette
- Aiutare con la pianificazione della produzione
- Rispondere a domande sui cibi e sulla cucina
- Interpretare comandi vocali per aggiungere ingredienti

COMANDI SPECIALI che puoi riconoscere:
- "aggiungi [quantità] [unità] di [ingrediente]" 
- "cosa posso cucinare?"
- "quanto costa fare [ricetta]?"
- "suggerisci qualcosa con [ingrediente]"

Rispondi sempre in italiano, sii pratico e utile per un ambiente di ristorazione.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200
      })
    });
    
    const data = await response.json();
    console.log('Risposta OpenAI:', JSON.stringify(data, null, 2));
    
    // Controlliamo se c'è un errore nella risposta
    if (data.error) {
      console.log('Errore OpenAI:', data.error);
      res.status(400).json({ error: data.error.message });
      return;
    }
    
    res.json(data);
  } catch (err) {
    console.log('Errore nella richiesta:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));