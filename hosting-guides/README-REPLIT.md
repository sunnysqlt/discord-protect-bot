# 🚀 Bot de Protection - Déploiement Replit (Alternative)

## 🎯 Pourquoi Replit ?

✅ **Upload direct** - Pas besoin de GitHub
✅ **Rapide** - Copier/coller les fichiers
✅ **Simple** - Interface web intégrée
✅ **Gratuit** - 24/7 avec limitations

## 📋 Étape 1 : Créer un Repl

1. Allez sur https://replit.com/
2. Cliquez "Create Repl"
3. Choisissez "Node.js"
4. Donnez un nom : `bot-protection`
5. Cliquez "Create Repl"

## 📋 Étape 2 : Uploader les fichiers

### 1. Créer les dossiers
Dans le panneau de gauche, créez ces dossiers :
- `commands/`
- `commands/utility/`
- `commands/moderation/`

### 2. Uploader les fichiers
1. **bot.js** - Fichier principal
2. **package.json** - Dépendances
3. **config.json** - Configuration
4. **.env** - Variables d'environnement
5. **commands/utility/help.js**
6. **commands/utility/status.js**
7. **commands/utility/owner.js**
8. **commands/utility/logs.js**
9. **commands/utility/banall.js**
10. **commands/utility/lockdown.js**
11. **commands/utility/unlockdown.js**
12. **commands/utility/antiraid.js**
13. **commands/utility/antibanall.js**
14. **commands/utility/antinuke.js**
15. **commands/utility/antispam.js**
16. **commands/utility/antilink.js**
17. **commands/utility/antieveryone.js**
18. **commands/utility/antizalgo.js**
19. **commands/utility/antiemoji.js**
20. **commands/utility/antighostping.js**
21. **commands/utility/antiimage.js**
22. **commands/utility/antinewaccount.js**
23. **commands/utility/antiselfbot.js**
24. **commands/moderation/ban.js**
25. **commands/moderation/kick.js**
26. **commands/moderation/mute.js**

### 3. Contenu du fichier .env
```env
TOKEN=votre_token_discord
PREFIX=&
OWNER_ID=1432452650531815584
EMBED_COLOR=#8B008B
```

## 📋 Étape 3 : Installer les dépendances

1. Dans la console Replit, tapez :
```bash
npm install
```

2. Attendez la fin de l'installation

## 📋 Étape 4 : Démarrer le bot

1. Cliquez sur le gros bouton vert "Run"
2. Attendez le démarrage
3. Vous devriez voir dans la console :
```
[SERVER] Serveur web démarré sur le port 3000
[START] Démarrage du bot...
[TOKEN] Token chargé: OK
[PROTECTION] ProtectBot - Bot de Protection est en ligne !
```

## ✅ Vérification

1. **Testez le bot** sur Discord :
   - Tapez `&help`
   - Tapez `&status`

2. **Vérifiez la console** Replit :
   - Aucune erreur rouge
   - Messages de connexion réussie

## ⚠️ Limitations Replit

- **Inactivité** : Le bot peut s'endormir après 30 minutes
- **Ressources** : Limitées mais suffisantes pour début
- **Performance** : Moins stable que Nexus

## 🔧 Si ça ne marche pas

### Erreur "Module not found"
- Vérifiez que `npm install` a bien fonctionné
- Regardez les erreurs dans la console

### Erreur "TOKEN undefined"
- Vérifiez le fichier `.env`
- Assurez-vous que le token est correct

### Erreur "Cannot connect to Discord"
- Vérifiez que le token Discord est valide
- Regénérez le token si nécessaire

### Le bot s'éteint
- Cliquez "Run" pour le redémarrer
- Replit peut mettre en pause après inactivité

## 🎯 Avantages

✅ **Très simple** - Copier/coller direct
✅ **Pas besoin de GitHub** - Rapide à déployer
✅ **Interface web** - Console intégrée
✅ **Gratuit** - 24/7 avec limitations

## 📋 Résumé

1. **Replit** → Create Repl Node.js
2. **Upload** → Copiez tous les fichiers
3. **.env** → Mettez votre token
4. **npm install** → Installez les dépendances
5. **Run** → Bot en ligne !

---

**Alternative rapide si GitHub ne fonctionne pas !** 🚀

**Questions ?** Demandez-moi de l'aide pour Replit !
