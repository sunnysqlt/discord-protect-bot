@echo off
echo ========================================
echo   BOT DE PROTECTION - GITHUB + NEXUS
echo ========================================
echo.
echo  ETAPES POUR DEPLOYER SUR NEXUS HOSTING
echo ========================================
echo.
echo 1. CREER UN REPO GITHUB PUBLIC
echo    - Allez sur https://github.com
echo    - New repository
echo    - Name: bot-protection
echo    - Public: OUI (obligatoire)
echo.
echo 2. UPLOADER LES FICHIERS
echo    - Copiez tous les fichiers du bot
echo    - git add .
echo    - git commit -m "Bot de Protection complet"
echo    - git push -u origin main
echo.
echo 3. CONFIGURER NEXUS
echo    - Allez sur nexushosting.net
echo    - Add New Bot
echo    - Import from GitHub
echo    - Choisissez votre repo
echo    - Environment Variables
echo    - KEY: TOKEN
echo    - VALUE: votre_token_discord
echo.
echo 4. DEPLOYER
echo    - Cliquez Start sur Nexus
echo    - Attendez 2-3 minutes
echo.
echo ========================================
echo   RESULTAT: BOT EN LIGNE 24/7 GRATUIT
echo ========================================
echo.
echo   Guide complet: README-GITHUB-NEXUS.md
echo   Support: Demandez-moi de l'aide !
echo.
pause
