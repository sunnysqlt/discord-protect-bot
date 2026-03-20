# 🚀 Bot de Protection - Déploiement Nexus Hosting via GitHub

## 🎯 Objectif

Déployer votre bot Discord sur Nexus Hosting en utilisant GitHub pour un hébergement 24/7 gratuit.

## 📋 Prérequis

1. **Compte GitHub** avec le code du bot
2. **Compte Nexus** créé
3. **Bot Discord** avec le token

## 🛠️ Étape 1 : Préparer GitHub

### 1. Créer le repository
1. Allez sur https://github.com
2. Cliquez "New repository"
3. Remplissez :
   - **Repository name**: `bot-protection`
   - **Description**: `Bot Discord de Protection Ultime`
   - **Visibility**: Public (obligatoire pour Nexus gratuit)
   - **Add README file**: Oui
4. Cliquez "Create repository"

### 2. Uploader les fichiers
1. Clonez votre repo localement :
   ```bash
   git clone https://github.com/votreusername/bot-protection.git
   cd bot-protection
   ```

2. Copiez tous les fichiers du bot :
   - `bot.js`
   - `package.json`
   - `.env.example`
   - `commands/` (tout le dossier)
   - `config.json`

3. Ajoutez les fichiers à Git :
   ```bash
   git add .
   git commit -m "Ajout du bot de protection complet"
   git push -u origin main
   ```

### 3. Vérifier le repository
- Assurez-vous que tous les fichiers sont bien sur GitHub
- Le repo doit être **public** (obligatoire pour Nexus gratuit)

## 🛠️ Étape 2 : Configurer Nexus

### 1. Créer le bot sur Nexus
1. Allez sur https://nexushosting.net/
2. "Add New Bot"
3. Remplissez :
   - **Name**: `ProtectBot`
   - **Language**: `Node.js`
   - **RAM**: `256 MB`
   - **CPU**: `1 Core`
   - **Storage**: `512 MB`

### 2. Importer depuis GitHub (Recommandé)
1. Cliquez sur "Import from GitHub"
2. Connectez votre compte GitHub
3. Choisissez votre repository `bot-protection`
4. Cliquez "Import"

### 3. Configurer les variables d'environnement
1. Allez dans "Environment Variables"
2. Ajoutez :
   - **KEY**: `TOKEN`
   - **VALUE**: `votre_token_discord`
3. Cliquez "Save"

## 🚀 Étape 3 : Déployer

1. Cliquez sur "Start" ou "Deploy"
2. Attendez le déploiement (1-3 minutes)
3. Vérifiez les logs pour voir :
   ```
   [SERVER] Serveur web démarré sur le port 3000
   [START] Démarrage du bot...
   [TOKEN] Token chargé: OK
   [LOGIN] Tentative de connexion à Discord...
   [PROTECTION] ProtectBot - Bot de Protection est en ligne !
   ```

## ✅ Vérification finale

### 1. Testez le bot
- Allez sur votre serveur Discord
- Tapez `&help`
- Tapez `&status`

### 2. Vérifiez les logs Nexus
- Allez dans "Logs" de votre bot sur Nexus
- Vous devriez voir "Bot connecté"

### 3. Tableau de bord
- Uptime: 100%
- Status: Online
- RAM: Utilisation normale

## 🔧 Si ça ne marche pas

### Erreur "Repository not found"
- Vérifiez que votre repo GitHub est public
- Vérifiez l'URL du repository

### Erreur "Module not found"
- Vérifiez que `package.json` est bien sur GitHub
- Redéployez le bot

### Erreur "TOKEN undefined"
- Vérifiez la variable d'environnement sur Nexus
- Assurez-vous que la clé est bien `TOKEN`

### Erreur "Cannot connect to Discord"
- Vérifiez que le token Discord est valide
- Regénérez le token si nécessaire

## 🎯 Avantages de cette méthode

✅ **Automatique** - Mise à jour automatique avec Git
✅ **Propre** - Code organisé sur GitHub
✅ **Gratuit** - 24/7 sans payer
✅ **Stable** - Meilleure performance
✅ **Backup** - Code sauvegardé sur GitHub

## 📋 Résumé rapide

1. **GitHub** → Repo public avec tous les fichiers
2. **Nexus** → Import GitHub + Variable TOKEN
3. **Deploy** → Bot en ligne 24/7 gratuit

---

**Votre bot est maintenant prêt pour Nexus Hosting !** 🎉

**Questions ?** Demandez-moi pour chaque étape !
