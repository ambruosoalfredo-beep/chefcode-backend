import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

// Import WebView App per HTML nativo
import WebViewApp from './WebViewApp';

// Import ChefCode API (path relativo corretto)
const ChefCodeAPI = require('./shared/api.js');
const { storage, parser, validator, formatter, device } = require('./shared/utils.js');
import BackendConfig from './BackendConfig.js';

// Configurazione ottimizzata per produzione cloud
const BACKEND_CONFIG = {
  getUrl() {
    return BackendConfig.getApiUrl();
  },
  
  timeout: BackendConfig.timeout,
  retryAttempts: BackendConfig.retryAttempts,
  
  log(message, data) {
    BackendConfig.log(message, data);
  }
};

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, connected, error
  
  const [isRecording, setIsRecording] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  
  // Stato per navigazione (replicando la webapp)
  const [currentPage, setCurrentPage] = useState('step-selection'); // step-selection, goods-in, recipe-setup, production, etc.
  
  // Inizializza API con configurazione dinamica per produzione/development
  const api = new ChefCodeAPI(BACKEND_CONFIG.getUrl());
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    // Test connessione backend con retry per Render
    BACKEND_CONFIG.log('🚀 ChefCode Mobile starting...');
    BACKEND_CONFIG.log('🌐 Backend URL:', BACKEND_CONFIG.getUrl());
    BACKEND_CONFIG.log('☁️ Backend Type: Render Cloud');
    
    setBackendStatus('checking');
    
    // Retry logic per Render (può essere lento al primo avvio)
    let connectionSuccess = false;
    for (let attempt = 1; attempt <= BACKEND_CONFIG.retryAttempts; attempt++) {
      BACKEND_CONFIG.log(`🔄 Connection attempt ${attempt}/${BACKEND_CONFIG.retryAttempts}`);
      
      const connectionTest = await api.testConnection();
      
      if (connectionTest.success) {
        connectionSuccess = true;
        setBackendStatus('connected');
        setServerConnected(true);
        BACKEND_CONFIG.log('✅ Backend connected successfully');
        break;
      } else {
        BACKEND_CONFIG.log(`❌ Attempt ${attempt} failed:`, connectionTest.error);
        if (attempt < BACKEND_CONFIG.retryAttempts) {
          BACKEND_CONFIG.log(`⏳ Waiting ${BACKEND_CONFIG.retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, BACKEND_CONFIG.retryDelay));
        }
      }
    }
    
    if (!connectionSuccess) {
      setBackendStatus('error');
      setServerConnected(false);
      BACKEND_CONFIG.log('💾 Using local data as fallback');
    }
    
    // Carica dati sempre (locali se backend non disponibile)
    await loadData();
  };
  
  const loadData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    
    try {
      // 1. Carica sempre da storage locale prima (offline-first)
      const savedData = await storage.load();
      if (savedData) {
        setInventory(savedData.inventory || []);
        setRecipes(savedData.recipes || {});
        setTasks(savedData.tasks || []);
        console.log('📱 Dati caricati da storage locale');
      }
      
      // 2. Tenta connessione server
      console.log(`🔍 Tentativo connessione server: ${serverIP}:3000`);
      const serverAvailable = await api.ping();
      setServerConnected(serverAvailable);
      
      if (serverAvailable) {
        console.log('✅ Server connesso - sincronizzazione...');
        const serverInventory = await api.getInventory();
        const serverRecipes = await api.getRecipes();
        const serverTasks = await api.getTasks();
        
        // Aggiorna state con dati server
        setInventory(serverInventory);
        setRecipes(serverRecipes);
        setTasks(serverTasks);
        
        // Salva dati aggiornati in locale
        await storage.save({
          inventory: serverInventory,
          recipes: serverRecipes,
          tasks: serverTasks
        });
        
        console.log('🔄 Sincronizzazione completata');
      } else {
        console.log('❌ Server non raggiungibile - modalità offline');
        if (!savedData) {
          Alert.alert(
            'Server non raggiungibile',
            `Assicurati che:\n1. Il backend sia avviato (start.bat)\n2. IP server sia corretto: ${serverIP}\n3. Dispositivo sia sulla stessa rete WiFi`
          );
        }
      }
    } catch (error) {
      console.error('❌ Errore caricamento:', error);
      setServerConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.sendChatMessage(chatMessage);
      setChatResponse(response.choices?.[0]?.message?.content || 'Risposta non disponibile');
      
      // Se c'è sincronizzazione dati, aggiorna lo stato
      if (response.syncData) {
        setInventory(response.syncData.inventory || inventory);
        setRecipes(response.syncData.recipes || recipes);
        
        // Salva localmente
        await storage.save({
          inventory: response.syncData.inventory || inventory,
          recipes: response.syncData.recipes || recipes
        });
      }
    } catch (error) {
      Alert.alert('Errore', 'Impossibile inviare messaggio: ' + error.message);
    } finally {
      setLoading(false);
      setChatMessage('');
    }
  };
  
  // Voice Recognition
  const startVoiceRecording = async () => {
    try {
      setIsRecording(true);
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permesso richiesto', 'ChefCode ha bisogno del microfono per i comandi vocali');
        setIsRecording(false);
        return;
      }
      
      // Simula riconoscimento vocale (per demo)
      // In produzione useresti expo-speech-recognition o libreria simile
      setTimeout(() => {
        const demoCommands = [
          'aggiungi 2 kg pasta 3 euro',
          'aggiungi 500 grammi pomodori 2 euro e 50',
          'aggiungi 1 litro latte 4 euro'
        ];
        const randomCommand = demoCommands[Math.floor(Math.random() * demoCommands.length)];
        setChatMessage(randomCommand);
        setIsRecording(false);
        
        Speech.speak('Comando riconosciuto: ' + randomCommand, { language: 'it-IT' });
      }, 2000);
      
    } catch (error) {
      console.error('Errore riconoscimento vocale:', error);
      setIsRecording(false);
      Alert.alert('Errore', 'Problema con riconoscimento vocale: ' + error.message);
    }
  };

  const addInventoryItem = async () => {
    Alert.prompt(
      'Aggiungi Ingrediente',
      'Usa comandi come: "2 kg pasta 3€"',
      async (text) => {
        if (!text) return;
        
        const parsed = parser.parseItalianCommand('aggiungi ' + text);
        const validation = validator.validateIngredient(parsed);
        
        if (!validation.isValid) {
          Alert.alert('Errore', validation.errors.join('\n'));
          return;
        }
        
        const newItem = {
          name: parsed.name,
          quantity: parsed.quantity,
          unit: parsed.unit,
          price: parsed.price,
          category: 'Aggiunto da mobile'
        };
        
        const newInventory = [...inventory, newItem];
        setInventory(newInventory);
        
        // Salva localmente
        await storage.save({ 
          inventory: newInventory, 
          recipes, 
          tasks 
        });
        
        // Sincronizza con server se disponibile
        if (serverConnected) {
          try {
            await api.addInventoryItem(newItem);
            console.log('✅ Item sincronizzato con server');
          } catch (error) {
            console.log('⚠️ Errore sincronizzazione server:', error.message);
          }
        }
        
        Alert.alert('Successo', `${parsed.name} aggiunto all'inventario!`);
      }
    );
  };
  
  // Render pagina principale (step selection)
  const renderStepSelection = () => (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>ChefCode</Text>
      <View style={styles.stepGrid}>
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('goods-in')}
        >
          <Text style={styles.stepIcon}>📦</Text>
          <Text style={styles.stepText}>GOODS IN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('recipe-setup')}
        >
          <Text style={styles.stepIcon}>🍽️</Text>
          <Text style={styles.stepText}>RECIPE SET-UP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('production')}
        >
          <Text style={styles.stepIcon}>🏭</Text>
          <Text style={styles.stepText}>PRODUCTION</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('sales')}
        >
          <Text style={styles.stepIcon}>💰</Text>
          <Text style={styles.stepText}>SALES</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('shopping-list')}
        >
          <Text style={styles.stepIcon}>🛒</Text>
          <Text style={styles.stepText}>SHOPPING LIST</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('dashboard')}
        >
          <Text style={styles.stepIcon}>📊</Text>
          <Text style={styles.stepText}>DASHBOARD</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('inventory')}
        >
          <Text style={styles.stepIcon}>📋</Text>
          <Text style={styles.stepText}>INVENTORY</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('chat-ai')}
        >
          <Text style={styles.stepIcon}>🤖</Text>
          <Text style={styles.stepText}>CHAT AI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render pagina Goods In
  const renderGoodsIn = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentPage('step-selection')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>GOODS IN</Text>
      </View>
      
      <View style={styles.stepGrid}>
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => Alert.alert('Feature', 'Invoice Photo OCR coming soon!')}
        >
          <Text style={styles.stepIcon}>📷</Text>
          <Text style={styles.stepText}>INVOICE PHOTO (OCR)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('manual-input')}
        >
          <Text style={styles.stepIcon}>⌨️</Text>
          <Text style={styles.stepText}>MANUAL INPUT</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.bigStepButton} 
          onPress={() => setCurrentPage('voice-input')}
        >
          <Text style={styles.stepIcon}>🎤</Text>
          <Text style={styles.stepText}>VOICE INPUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render altre pagine
  const renderManualInput = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentPage('goods-in')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>MANUAL INPUT</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Nome prodotto"
          value=""
          onChangeText={() => {}}
        />
        <TouchableOpacity style={styles.submitButton} onPress={addInventoryItem}>
          <Text style={styles.buttonText}>+ Aggiungi all'inventario</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderInventory = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentPage('step-selection')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>INVENTORY ({inventory.length})</Text>
      </View>
      
      <View style={styles.listContainer}>
        {inventory.map((item, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetails}>
              {item.quantity} {item.unit} • €{item.price}
            </Text>
          </View>
        ))}
        
        {inventory.length === 0 && (
          <Text style={styles.emptyText}>Nessun ingrediente nell'inventario</Text>
        )}
      </View>
    </View>
  );

  const renderChatAI = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentPage('step-selection')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>CHAT AI</Text>
      </View>
      
      <View style={styles.chatContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Scrivi un comando... (es: aggiungi 2 kg pasta)"
          value={chatMessage}
          onChangeText={setChatMessage}
          multiline
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.voiceButton, { backgroundColor: isRecording ? '#e74c3c' : '#9b59b6' }]} 
            onPress={startVoiceRecording}
            disabled={isRecording}
          >
            <Text style={styles.buttonText}>
              {isRecording ? '🎙️' : '🎤'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sendButton, { opacity: (loading || !chatMessage.trim()) ? 0.5 : 1 }]} 
            onPress={sendChatMessage}
            disabled={loading || !chatMessage.trim()}
          >
            <Text style={styles.buttonText}>✈️</Text>
          </TouchableOpacity>
        </View>
        
        {chatResponse ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{chatResponse}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.pageContainer}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setCurrentPage('step-selection')}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>DASHBOARD</Text>
      </View>
      
      <View style={styles.dashboardContainer}>
        <Text style={styles.dashboardText}>Dashboard features coming soon!</Text>
      </View>
    </View>
  );

  // App apre direttamente con WebView HTML nativo
  return <WebViewApp />;

  // Questo codice non viene mai eseguito perché l'app usa direttamente WebView
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <Text style={styles.statusText}>
            {backendStatus === 'connected' ? '🟢 Cloud Connected' : 
             backendStatus === 'checking' ? '🟡 Connecting...' : '🔴 Offline Mode'}
          </Text>
        </View>
        
        {/* Navigazione condizionale basata su currentPage */}
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadData(false)} />
          }
        >
          {currentPage === 'step-selection' && renderStepSelection()}
          {currentPage === 'goods-in' && renderGoodsIn()}
          {currentPage === 'manual-input' && renderManualInput()}
          {currentPage === 'inventory' && renderInventory()}
          {currentPage === 'chat-ai' && renderChatAI()}
        </ScrollView>
        
        {loading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Caricamento...</Text>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  // Toggle Container
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#34495e',
    margin: 10,
    borderRadius: 25,
    padding: 2,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#3498db',
  },
  toggleText: {
    color: '#ecf0f1',
    fontWeight: '600',
    fontSize: 14,
  },
  activeToggleText: {
    color: 'white',
  },
  
  // Status Header
  statusHeader: {
    backgroundColor: '#2c3e50',
    padding: 8,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Page Container
  pageContainer: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
  },
  
  // Header with Back Button
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '500',
  },
  
  // Step Grid
  stepGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bigStepButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  
  // Form Container
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  
  // List Container
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  
  // Chat Container
  chatContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  
  // Dashboard
  dashboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  
  // Old styles (to maintain compatibility)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c3e50',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 12,
    color: '#ecf0f1',
    marginTop: 2,
  },
  reloadButton: {
    backgroundColor: '#3498db',
    padding: 8,
    borderRadius: 8,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    maxHeight: 100,
  },
  voiceButton: {
    backgroundColor: '#9b59b6',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 8,
    minWidth: 45,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#27ae60',
    padding: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: '#ecf0f1',
    padding: 12,
    borderRadius: 8,
  },
  responseText: {
    color: '#2c3e50',
  },
  inventoryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  itemDetails: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  recipeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  recipeIngredients: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    fontStyle: 'italic',
    marginTop: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
});