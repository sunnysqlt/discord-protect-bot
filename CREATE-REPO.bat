@echo off
echo ========================================
echo   CREATION REPO GITHUB - BOT PROTECTION
echo ========================================
echo.
echo Ce script va creer un repository GitHub
echo avec tous les fichiers du bot
echo.
echo 1. Creation du repo...
echo.

cd /d "c:\Users\nanou\Desktop\protect"

git init
git add .
git commit -m "Bot de Protection Ultime - 15 protections"
git branch -M main

echo.
echo 2. Ajout du remote GitHub...
echo.

git remote add origin https://github.com/sunnysqlt/discord-protect-bot.git

echo.
echo 3. Push vers GitHub...
echo.

git push -u origin main

echo.
echo ========================================
echo   REPO CREE SUR GITHUB !
echo ========================================
echo.
echo URL: https://github.com/sunnysqlt/discord-protect-bot
echo.
echo Vous pouvez maintenant:
echo - 1. Importer ce repo sur Nexus Hosting
echo - 2. Configurer la variable TOKEN
echo - 3. Deployer votre bot 24/7 gratuit
echo.
echo ========================================
pause
