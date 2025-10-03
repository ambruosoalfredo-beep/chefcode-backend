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

// Import ChefCode API (path relativo corretto)
const ChefCodeAPI = require('../../shared/api.js');
const { storage, parser, validator, formatter, device } = require('../../shared/utils.js');

export default function App() {
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState({});
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  
  // Initialize API - IMPORTANTE: Cambia questo IP con il tuo IP locale della rete
  const [serverIP, setServerIP] = useState('192.168.1.100'); // ⚠️ CAMBIA QUESTO
  const api = new ChefCodeAPI(`http://${serverIP}:3000`);
  
  useEffect(() => {
    loadData();
  }, []);
  
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
  
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🍳 ChefCode Mobile</Text>
            <Text style={styles.subtitle}>
              {serverConnected ? '🟢 Server connesso' : '🔴 Modalità offline'}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.reloadButton, { opacity: loading ? 0.5 : 1 }]} 
            onPress={() => loadData(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>🔄</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadData(false)} />
          }
        >
          {/* Chat AI Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 Chat AI</Text>
            <View style={styles.chatContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Scrivi un comando... (es: aggiungi 2 kg pasta)"
                value={chatMessage}
                onChangeText={setChatMessage}
                multiline
              />
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
          
          {/* Inventory Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📦 Inventario ({inventory.length})</Text>
              <TouchableOpacity style={styles.addButton} onPress={addInventoryItem}>
                <Text style={styles.buttonText}>+ Aggiungi</Text>
              </TouchableOpacity>
            </View>
            
            {inventory.map((item, index) => (
              <View key={index} style={styles.inventoryItem}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDetails}>
                  {formatter.quantity(item.quantity, item.unit)} • {formatter.currency(item.price)}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>
            ))}
            
            {inventory.length === 0 && (
              <Text style={styles.emptyText}>Nessun ingrediente nell'inventario</Text>
            )}
          </View>
          
          {/* Recipes Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Ricette ({Object.keys(recipes).length})</Text>
            {Object.keys(recipes).map((recipeName) => (
              <View key={recipeName} style={styles.recipeItem}>
                <Text style={styles.recipeName}>{recipeName}</Text>
                <Text style={styles.recipeIngredients}>
                  {recipes[recipeName].items?.length || 0} ingredienti
                </Text>
              </View>
            ))}
            
            {Object.keys(recipes).length === 0 && (
              <Text style={styles.emptyText}>Nessuna ricetta configurata</Text>
            )}
          </View>
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