import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Constants from 'expo-constants';

const WebViewApp = () => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4E6F" />
      
      {/* WebView che carica la tua web app dai file assets */}
      <WebView
        style={styles.webview}
        source={{ uri: 'file:///android_asset/index.html' }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        mixedContentMode="compatibility"
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        originWhitelist={['*']}
        onError={(error) => {
          console.log('❌ WebView Error:', error.nativeEvent);
        }}
        onLoadEnd={() => {
          console.log('✅ ChefCode web app caricata dagli assets');
        }}
        onLoadStart={() => {
          console.log('🔄 Caricamento ChefCode web app...');
        }}
      />
    </View>
  );
};

// Fallback: se ci sono problemi con il caricamento file, uso HTML embedded
const WebViewAppFallback = () => {
  // La tua web app ChefCode COMPLETA come stringa HTML
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChefCode - Workflow Simulation</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow-x: hidden;
            margin: 0;
            padding: 0;
        }

        .header {
            background-color: #2E4E6F;
            color: white;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .header-left, .header-right {
            flex: 1;
            display: flex;
            align-items: center;
        }

        .header-center {
            flex: 2;
            text-align: center;
        }

        .home-button {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 0.5rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: background 0.3s ease;
        }

        .home-button:hover {
            background: rgba(255,255,255,0.2);
        }

        .logo {
            font-size: 1.8rem;
            font-weight: 700;
            color: #fff;
            margin: 0;
        }

        .account-menu {
            position: relative;
            margin-left: auto;
        }

        .account-button {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s ease;
        }

        .account-button:hover {
            background: rgba(255,255,255,0.2);
        }

        .dropdown-content {
            display: none;
            position: absolute;
            right: 0;
            background-color: white;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
            border-radius: 8px;
            z-index: 1001;
        }

        .dropdown-content a {
            color: #333;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
        }

        .dropdown-content a:hover {
            background-color: #f1f1f1;
        }

        .main-container {
            padding: 2rem;
            max-width: 1200px;
            margin: 0 auto;
            padding-bottom: 120px;
        }

        .page-section {
            display: none;
            background: white;
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        }

        .page-section.active {
            display: block;
        }

        .step-buttons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .big-step-button {
            background: linear-gradient(145deg, #ffffff, #f0f0f0);
            border: none;
            border-radius: 15px;
            padding: 2rem 1rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            min-height: 150px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }

        .big-step-button:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            background: linear-gradient(145deg, #f8f9fa, #e9ecef);
        }

        .big-step-button i {
            font-size: 2.5rem;
            color: #667eea;
            margin-bottom: 0.5rem;
        }

        .big-step-button span {
            font-size: 1rem;
            font-weight: 600;
            color: #333;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .back-button {
            background: #667eea;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            margin-bottom: 1rem;
            transition: background 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .back-button:hover {
            background: #5a67d8;
        }

        .page-header-with-back {
            margin-bottom: 2rem;
        }

        .page-header-with-back h3 {
            font-size: 1.5rem;
            color: #333;
            margin: 1rem 0;
        }

        .input-page {
            display: none;
        }

        .input-page.active {
            display: block;
        }

        .goods-in-buttons-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .manual-form {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-group.full-width {
            grid-column: 1 / -1;
        }

        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #333;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
            background: linear-gradient(145deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 10px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        /* Footer Voice */
        #voice-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: #2E4E6F;
            color: white;
            padding: 15px 30px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        #voice-footer button {
            background: linear-gradient(145deg, #ffffff, #e8e8e8);
            border: 2px solid #ffffff;
            color: #2c3e50;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        #voice-footer button:hover {
            background: linear-gradient(145deg, #f8f9fa, #ffffff);
            border-color: #a9cce3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            color: #1e3a8a;
        }

        #chatgpt-input {
            background: rgba(255, 255, 255, 0.95);
            border: 2px solid rgba(255, 255, 255, 0.8);
            color: #2c3e50;
            border-radius: 25px;
            padding: 10px 16px;
            width: 200px;
            margin-right: 10px;
            font-size: 0.9em;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            height: 45px;
            box-sizing: border-box;
        }

        #chatgpt-input::placeholder {
            color: rgba(44, 62, 80, 0.6);
            font-style: italic;
        }

        #chatgpt-input:focus {
            background: rgba(255, 255, 255, 1);
            border-color: #a9cce3;
            outline: none;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1), 0 0 8px rgba(169, 204, 227, 0.3);
            transform: scale(1.02);
        }

        #voice-btn {
            background: linear-gradient(145deg, #ffffff, #e8e8e8);
            border: 2px solid #ffffff;
            color: #2c3e50;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            transition: all 0.3s ease;
            cursor: pointer;
        }

        #voice-btn:hover {
            background: linear-gradient(145deg, #f8f9fa, #ffffff);
            border-color: #a9cce3;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
            color: #1e3a8a;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .main-container {
                padding: 1rem;
            }
            
            .step-buttons-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
            }
            
            .big-step-button {
                padding: 1.5rem 0.5rem;
                min-height: 120px;
            }
            
            .big-step-button i {
                font-size: 2rem;
            }
            
            .big-step-button span {
                font-size: 0.9rem;
            }

            .header {
                padding: 0.5rem 1rem;
            }

            .logo {
                font-size: 1.4rem;
            }

            #voice-footer {
                padding: 10px 15px;
            }

            #chatgpt-input {
                width: 150px;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <button class="home-button" id="chefcode-logo-btn">
                <i class="fas fa-home"></i>
            </button>
        </div>
        <div class="header-center">
            <h1 class="logo">ChefCode</h1>
        </div>
        <div class="header-right">
            <div class="account-menu">
                <button class="account-button">Account <span class="arrow-down">&#9660;</span></button>
                <div class="dropdown-content">
                    <a href="#">Profile</a>
                    <a href="#">Settings</a>
                    <a href="#">Logout</a>
                </div>
            </div>
        </div>
    </header>

    <main class="main-container">
        <section id="step-selection-page" class="page-section active">
            <div class="step-buttons-grid">
                <button class="big-step-button" data-step="goods-in">
                    <i class="fas fa-box-open"></i>
                    <span>GOODS IN</span>
                </button>
                <button class="big-step-button" data-step="recipe-set-up">
                    <i class="fas fa-utensils"></i>
                    <span>RECIPE SET-UP</span>
                </button>
                <button class="big-step-button" data-step="production">
                    <i class="fas fa-industry"></i>
                    <span>PRODUCTION</span>
                </button>
                <button class="big-step-button" data-step="sales">
                    <i class="fas fa-cash-register"></i>
                    <span>SALES</span>
                </button>
                <button class="big-step-button" data-step="end-of-day">
                    <i class="fas fa-shopping-basket"></i>
                    <span>SHOPPING LIST</span>
                </button>
                <button class="big-step-button" data-step="dashboard-selection">
                    <i class="fas fa-chart-line"></i>
                    <span>DASHBOARD</span>
                </button>
                <button class="big-step-button" data-step="inventory-page">
                    <i class="fas fa-clipboard-check"></i>
                    <span>INVENTORY</span>
                </button>
                <button class="big-step-button" data-step="add-module">
                    <i class="fas fa-plus"></i>
                    <span>ADD MODULE</span>
                </button>
            </div>
        </section>

        <section id="input-detail-page" class="page-section">
            <div id="input-pages-container">
                
                <div id="goods-in-content" class="input-page">
                    <div class="page-header-with-back">
                        <button class="back-button" data-back-target="step-selection-page">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <h3>GOODS IN</h3>
                    </div>
                    <div class="goods-in-buttons-grid">
                        <button class="big-step-button" data-action="invoice-photo">
                            <i class="fas fa-camera"></i>
                            <span>INVOICE PHOTO (OCR)</span>
                        </button>
                        <button class="big-step-button" data-action="manual-input">
                            <i class="fas fa-keyboard"></i>
                            <span>MANUAL INPUT</span>
                        </button>
                    </div>
                </div>

                <div id="manual-input-content" class="input-page">
                    <div class="page-header-with-back">
                        <button class="back-button" data-back-target="goods-in-content">
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <h3>MANUAL INPUT</h3>
                    </div>
                    <form id="manual-entry-form" class="manual-form">
                        <div class="form-group full-width">
                            <label for="item-name">Item Name</label>
                            <input type="text" id="item-name" name="item-name" placeholder="e.g., San Marzano Tomatoes" required>
                        </div>
                        <div class="form-group">
                            <label for="item-quantity">Quantity</label>
                            <input type="number" id="item-quantity" name="item-quantity" placeholder="e.g., 25" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="item-unit">Unit</label>
                            <input type="text" id="item-unit" name="item-unit" placeholder="e.g., kg" required>
                        </div>
                        <div class="form-group">
                            <label for="item-category">Category</label>
                            <input type="text" id="item-category" name="item-category" placeholder="e.g., Vegetables" required>
                        </div>
                        <div class="form-group">
                            <label for="item-price">Unit Price (€)</label>
                            <input type="number" id="item-price" name="item-price" placeholder="e.g., 2.50" step="0.01" required>
                        </div>
                        <div style="text-align:center; margin-top:16px;">
                            <button type="submit" class="submit-btn">
                                <i class="fas fa-save"></i> Add to Inventory
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </section>
    </main>

    <footer id="voice-footer">
        <div style="display:flex; justify-content:center; align-items:center; gap:32px;">
            <div id="chatgpt-chat" style="display:flex; flex-direction:column; align-items:center;">
                <div style="display:flex; gap:8px; align-items:center;">
                    <input type="text" id="chatgpt-input" placeholder="Ask me anything...">
                    <button id="send-btn" type="button" title="Send Message">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button id="voice-chat-btn" type="button" title="Voice Message">
                        <i class="fas fa-microphone"></i>
                    </button>
                    <button id="upload-btn" type="button" title="Upload File">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div id="chatgpt-response" style="margin-top:8px; font-size:0.85em; min-height:20px; max-width:350px; max-height:60px; overflow-y:auto; text-align:left; word-wrap:break-word; transition:opacity 0.3s ease; color: #ffffff;"></div>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center;">
                <button id="voice-btn">
                    <i class="fas fa-microphone" id="voice-mic-icon" style="font-size: 1.5em;"></i>
                </button>
                <div id="voice-status-label" style="font-size:0.9em; margin-top:6px; color:#ffffff; font-weight:500;">Press to speak</div>
            </div>
        </div>
        <div id="voice-result" style="margin-top:8px; font-size:1em; color:#ffffff;"></div>
    </footer>

    <script>
        console.log('🚀 ChefCode WebView inizializzata!');
        
        // Gestione navigazione tra le pagine
        document.addEventListener('DOMContentLoaded', function() {
            console.log('✅ DOM loaded, inizializzando ChefCode...');
            
            // Navigazione pulsanti principali
            const stepButtons = document.querySelectorAll('.big-step-button[data-step]');
            console.log('Found step buttons:', stepButtons.length);
            stepButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const step = this.getAttribute('data-step');
                    console.log('Navigating to:', step);
                    navigateToPage(step);
                });
            });
            
            // Navigazione pulsanti back
            const backButtons = document.querySelectorAll('.back-button[data-back-target]');
            console.log('Found back buttons:', backButtons.length);
            backButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const target = this.getAttribute('data-back-target');
                    console.log('Going back to:', target);
                    navigateToPage(target);
                });
            });
            
            // Navigazione azioni specifiche
            const actionButtons = document.querySelectorAll('.big-step-button[data-action]');
            console.log('Found action buttons:', actionButtons.length);
            actionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const action = this.getAttribute('data-action');
                    console.log('Action clicked:', action);
                    handleAction(action);
                });
            });

            // Home button
            const homeButton = document.getElementById('chefcode-logo-btn');
            if (homeButton) {
                homeButton.addEventListener('click', function() {
                    console.log('Home button clicked');
                    navigateToPage('step-selection-page');
                });
            }

            console.log('✅ ChefCode inizializzato completamente!');
        });
        
        function navigateToPage(pageId) {
            console.log('Navigating to page:', pageId);
            
            // Nascondi tutte le pagine
            const allPages = document.querySelectorAll('.page-section, .input-page');
            allPages.forEach(page => {
                page.classList.remove('active');
            });
            
            // Mostra la pagina richiesta
            const targetPage = document.getElementById(pageId + '-content') || document.getElementById(pageId);
            if (targetPage) {
                targetPage.classList.add('active');
                console.log('✅ Activated page:', targetPage.id);
                
                // Se è una input-page, mostra anche il container padre
                if (targetPage.classList.contains('input-page')) {
                    document.getElementById('input-detail-page').classList.add('active');
                    console.log('✅ Also activated input-detail-page container');
                }
            } else {
                console.error('❌ Page not found:', pageId);
            }
        }
        
        function handleAction(action) {
            console.log('Handling action:', action);
            switch(action) {
                case 'manual-input':
                    navigateToPage('manual-input-content');
                    break;
                case 'invoice-photo':
                    alert('📷 Funzione Camera/OCR disponibile solo nella versione web completa');
                    break;
                case 'voice-input':
                    alert('🎤 Funzione Voice Input disponibile solo nella versione web completa');
                    break;
                default:
                    console.log('Azione non gestita:', action);
            }
        }
        
        // Gestione form manuale
        document.addEventListener('DOMContentLoaded', function() {
            const manualForm = document.getElementById('manual-entry-form');
            if (manualForm) {
                manualForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(this);
                    const item = {
                        name: formData.get('item-name'),
                        quantity: formData.get('item-quantity'),
                        unit: formData.get('item-unit'),
                        category: formData.get('item-category'),
                        price: formData.get('item-price')
                    };
                    
                    console.log('Nuovo item aggiunto:', item);
                    alert('✅ Item aggiunto: ' + item.name + ' (' + item.quantity + ' ' + item.unit + ')\\n💰 Prezzo: €' + item.price);
                    
                    // Reset form
                    this.reset();
                    
                    // Torna alla pagina precedente
                    navigateToPage('goods-in-content');
                });
            }
        });
        
        // Gestione footer voice e chat
        document.addEventListener('DOMContentLoaded', function() {
            const voiceBtn = document.getElementById('voice-btn');
            const chatInput = document.getElementById('chatgpt-input');
            const sendBtn = document.getElementById('send-btn');
            const voiceChatBtn = document.getElementById('voice-chat-btn');
            const uploadBtn = document.getElementById('upload-btn');
            
            if (voiceBtn) {
                voiceBtn.addEventListener('click', function() {
                    console.log('🎤 Voice button clicked');
                    const responseDiv = document.getElementById('voice-result');
                    if (responseDiv) {
                        responseDiv.textContent = '🎤 Funzione vocale simulata - ChefCode WebView attivo!';
                    }
                });
            }
            
            if (sendBtn && chatInput) {
                sendBtn.addEventListener('click', function() {
                    const message = chatInput.value.trim();
                    if (message) {
                        console.log('💬 Chat message:', message);
                        const responseDiv = document.getElementById('chatgpt-response');
                        if (responseDiv) {
                            responseDiv.textContent = '📨 Messaggio: ' + message;
                        }
                        chatInput.value = '';
                    }
                });
            }
            
            if (chatInput) {
                chatInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' && sendBtn) {
                        sendBtn.click();
                    }
                });
            }

            if (voiceChatBtn) {
                voiceChatBtn.addEventListener('click', function() {
                    console.log('🎤 Voice chat button clicked');
                    alert('🎤 Chat vocale disponibile solo nella versione web completa');
                });
            }

            if (uploadBtn) {
                uploadBtn.addEventListener('click', function() {
                    console.log('📎 Upload button clicked');
                    alert('📎 Upload file disponibile solo nella versione web completa');
                });
            }
        });
    </script>
</body>
</html>
  `;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4E6F" />
      
      {/* WebView che carica la tua VERA app ChefCode con HTML embedded */}
      <WebView
        style={styles.webview}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        onError={(error) => {
          console.log('❌ WebView Error:', error.nativeEvent);
        }}
        onLoadEnd={() => {
          console.log('✅ ChefCode app completamente caricata nel WebView!');
        }}
        onLoadStart={() => {
          console.log('🔄 Caricamento ChefCode app...');
        }}
        onConsoleMessage={(message) => {
          console.log('WebView Console:', message.nativeEvent.message);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingTop: Constants.default.statusBarHeight,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

// Esporta il componente che carica dai file assets
export default WebViewApp;