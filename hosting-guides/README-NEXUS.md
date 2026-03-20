# 🚀 Hébergement Gratuit sur Nexus Hosting

## 🎉 Pourquoi Nexus Hosting ?

✅ **Vraiment gratuit** - Pas besoin de carte bancaire
✅ **24/7 actif** - Bot ne s'éteint jamais
✅ **Sans ping** - Pas besoin de keep-alive
✅ **Node.js natif** - Support complet
✅ **Interface simple** - Facile à utiliser
✅ **Discord OAuth** - Connexion en 1 clic

## 📋 Étape 1 : Créer un compte

1. Allez sur **https://nexushosting.net/**
2. Cliquez sur **"Sign Up"** ou **"Register"**
3. **Connectez avec Discord** (bouton "Login with Discord")
   - Cliquez "Authorize"
   - Choisissez votre compte Discord
4. **Vérifiez votre email** si demandé

## 📋 Étape 2 : Créer un bot

1. Dans le dashboard Nexus, cliquez **"Add New Bot"**
2. Remplissez les informations :
   - **Name**: `ProtectBot`
   - **Language**: `Node.js`
   - **RAM**: `256 MB` (suffisant pour début)
   - **CPU**: `1 Core` (suffisant)
   - **Storage**: `512 MB`
3. Cliquez **"Create Bot"**

## 📋 Étape 3 : Ajouter votre code

### **Option A : Importer depuis GitHub** (Recommandé)

1. Cliquez sur **"Import from GitHub"**
2. Connectez votre compte GitHub
3. Choisissez votre repo `bot-protection`
4. Cliquez **"Import"**
5. Attendez que Nexus récupère les fichiers

### **Option B : Upload manuel**

1. Cliquez sur **"Upload Files"**
2. Uploadez ces fichiers :
   - `bot.js`
   - `package.json`
   - `.env`
   - Tous les dossiers `commands/`
   - Tous les dossiers `node_modules/` (si besoin)

## 📋 Étape 4 : Configuration

1. Dans le dashboard de votre bot, allez dans **"Environment Variables"**
2. Ajoutez ces variables :
   - **KEY**: `TOKEN`
   - **VALUE**: `votre_token_discord`
3. Cliquez **"Save"**

⚠️ **IMPORTANT**: Ne mettez JAMAIS votre token dans le code visible !

## 📋 Étape 5 : Démarrer le bot

1. Cliquez sur **"Start"** ou **"Deploy"**
2. Attendez le déploiement (1-2 minutes)
3. Vérifiez dans **"Logs"** que vous voyez :
   ```
   [SERVER] Serveur web démarré sur le port 3000
   [START] Démarrage du bot...
   [TOKEN] Token chargé: OK
   [LOGIN] Tentative de connexion à Discord...
   [PROTECTION] ProtectBot - Bot de Protection est en ligne !
   ```

## ✅ Vérification finale

1. **Testez le bot** sur votre serveur Discord :
   - Tapez `&help`
   - Tapez `&status`

2. **Vérifiez les logs** sur Nexus :
   - Allez dans "Logs" de votre bot
   - Vous devriez voir "Bot connecté"

3. **Bot reste actif 24/7** :
   - Pas de timeout
   - Pas de déconnexion
   - Performance stable

## 🔧 Si ça ne marche pas

### **Le bot ne démarre pas :**
1. Vérifiez le token dans Environment Variables
2. Regardez les logs sur Nexus
3. Assurez-vous que `express` est dans `package.json`

### **Le bot se déconnecte :**
1. Vérifiez que le token est valide
2. Regardez les logs d'erreurs
3. Redémarrez le bot depuis Nexus

### **Erreur 500 :**
1. Vérifiez que tous les fichiers sont uploadés
2. Assurez-vous que `node_modules` est complet
3. Vérifiez les permissions

## 🎯 Avantages Nexus vs Autres

| Plateforme | 24/7 Gratuit | Carte Bancaire | Sleep | Ping | Discord OAuth |
|------------|----------------|------------------|-------|------|--------------|
| **Nexus** | ✅ | ❌ | ❌ | ❌ | ✅ |
| Render | ❌ | ✅ | ✅ | ❌ | ❌ |
| Fly.io | ❌ | ✅ | ❌ | ❌ | ❌ |
| Replit | ❌ | ✅ | ✅ | ✅ | ❌ |

## 🚀 Votre bot est prêt !

Une fois ces étapes terminées :
- ✅ Bot en ligne 24/7 gratuitement
- ✅ Toutes les protections actives
- ✅ Interface professionnelle
- ✅ Support complet

**Félicitations ! Votre bot de protection est hébergé gratuitement !** 🎉

---

**Besoin d'aide ?** Demandez-moi pour chaque étape !
