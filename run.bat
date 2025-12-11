@echo off
REM -------------------------------------------------
REM  Launch script for the Cortex Vite app
REM -------------------------------------------------
REM Install dependencies if they are missing
if not exist "node_modules\" (
  echo Installing npm packages...
  npm i
)

REM Start the development server
echo Starting the Vite development server...
npm run dev

REM After the server is running, open the default browser to the local URL
REM Vite typically serves at http://localhost:5173 (adjust if your config uses a different port)
start "" "http://localhost:5173"