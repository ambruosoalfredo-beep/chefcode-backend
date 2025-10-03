@echo off
echo ================================================================
echo ChefCode Backend - Variabili d'Ambiente per Render
echo ================================================================
echo.
echo COPIA E INCOLLA queste variabili su Render Dashboard:
echo Environment Variables ^> Add Environment Variable
echo.
echo ----------------------------------------------------------------
echo VARIABILE 1 - Ambiente
echo ----------------------------------------------------------------
echo Key:   NODE_ENV
echo Value: production
echo.
echo ----------------------------------------------------------------
echo VARIABILE 2 - OpenAI API Key
echo ----------------------------------------------------------------
echo Key:   OPENAI_API_KEY
echo Value: YOUR_OPENAI_API_KEY_HERE
echo.
echo ----------------------------------------------------------------
echo VARIABILE 3 - CORS Origins
echo ----------------------------------------------------------------
echo Key:   ALLOWED_ORIGINS
echo Value: *
echo.
echo ----------------------------------------------------------------
echo OPZIONALI (se vuoi configurazioni avanzate)
echo ----------------------------------------------------------------
echo Key:   RATE_LIMIT_MAX
echo Value: 100
echo.
echo Key:   OPENAI_TIMEOUT
echo Value: 30000
echo.
echo Key:   LOG_LEVEL
echo Value: info
echo.
echo ================================================================
echo IMPORTANTE: 
echo - Su Render, vai in Environment Variables
echo - Clicca "Add Environment Variable" per ognuna
echo - Copia Key e Value esattamente come mostrato sopra
echo - Le prime 3 variabili sono OBBLIGATORIE
echo ================================================================
echo.
pause