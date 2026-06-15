@echo off
echo Iniciando Servidor Backend...
start cmd /k "cd backend && npm run dev"

echo Iniciando Plataforma Frontend...
start cmd /k "cd frontend && npm run dev"

echo ¡Ambos servidores se estan ejecutando en ventanas separadas!
