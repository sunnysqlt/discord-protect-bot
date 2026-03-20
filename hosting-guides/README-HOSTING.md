# 🚀 Hébergement Gratuit du Bot

## 📋 Prérequis

1. **Compte GitHub** créé
2. **Code du bot** prêt
3. **Token Discord** sécurisé

## 🛠️ Installation Express

### 1. Installer Express (déjà fait)
```bash
npm install express
```

### 2. Préparer pour GitHub

```bash
git init
git add .
git commit -m "Bot de Protection avec serveur web"
git remote add origin https://github.com/votreusername/bot-protection.git
git push -u origin main
```

## 🌐 Options d'Hébergement

### **⭐ Fly.io (Recommandé)**

✅ **24/7 gratuit** • ✅ **Vraiment actif** • ✅ **Pas de sleep**

1. Installez Fly CLI
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 | iex
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. Connectez-vous :
   ```bash
   fly auth login
   ```

3. Déployez :
   ```bash
   fly launch
   ```

4. Configurez les secrets :
   ```bash
   fly secrets set TOKEN=votre_token_discord
   ```

5. Déployez :
   ```bash
   fly deploy
   ```

6. Votre bot est en ligne 24/7 !

### **❌ Render.com (Non recommandé)**

⚠️ **Sleep après 15 minutes** → **Bot s'éteint** ❌

Non adapté pour les bots Discord qui doivent rester actifs.

### **Replit (Alternative)**

1. Allez sur https://replit.com/
2. "New Repl" → "Node.js"
3. Copiez tous vos fichiers
4. Ajoutez votre token dans `.env`
5. Cliquez "Run"

⚠️ **Peut s'endormir après inactivité**

### **Glitch (Alternative)**

1. Allez sur https://glitch.com/
2. "New Project" → "Import from GitHub"
3. Entrez votre repo GitHub
4. Ajoutez votre token dans `.env`
5. Le bot démarre automatiquement

⚠️ **Limitations de ressources**

## ⚙️ Configuration

### Variables d'environnement

**Sur Fly.io (recommandé) :**
```bash
fly secrets set TOKEN=votre_token_discord
```

**Sur autres plateformes :**
- **TOKEN**: votre token Discord
- **PORT**: 3000 (automatique)

### Vérification

Une fois déployé sur Fly.io :
- Votre bot reste actif 24/7
- Pas de timeout
- Performance stable

## 🔧 Dépannage

### Le bot ne démarre pas
- Vérifiez que le token est correct
- Regardez les logs : `fly logs`
- Assurez-vous que `express` est installé

### Erreur sur Fly.io
```bash
fly logs                    # Voir les logs
fly deploy                 # Redéployer
fly secrets list          # Vérifier les secrets
```

### Token invalide
- Le token doit être dans les secrets, pas dans le code
- Ne jamais mettre le token sur GitHub

## 🚀 Déploiement Rapide Fly.io

```bash
# 1. Installer Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Se connecter
fly auth login

# 3. Déployer
fly launch

# 4. Configurer le token
fly secrets set TOKEN=votre_token_discord

# 5. Lancer
fly deploy
```

**Résultat :** Bot en ligne 24/7 gratuit ! 🎉

---

**Pourquoi Fly.io ?**
- ✅ Vraiment gratuit 24/7
- ✅ Pas de sleep/timeout
- ✅ Supporte les bots Discord
- ✅ Facile à utiliser
- ✅ Logs en temps réel

**Questions ?** Demandez-moi de l'aide pour Fly.io !
