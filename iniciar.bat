@echo off
echo.
echo  CADENA - Monitoreo de Fenomenos
echo  ================================
echo.
cd /d "%~dp0"
echo  Iniciando servidor...
start /B node server.js
timeout /t 2 /nobreak >nul
echo  Abriendo navegador en http://localhost:3000
start http://localhost:3000
echo.
echo  El servidor esta corriendo. Cierra esta ventana para detenerlo.
echo  (O presiona Ctrl+C para salir)
echo.
node server.js
