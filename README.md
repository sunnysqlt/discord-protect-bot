# 🛡️ Bot Discord de Protection Ultime

Un bot Discord complet et avancé conçu pour protéger votre serveur contre toutes les menaces possibles avec un préfixe `&`.

## 🚀 Fonctionnalités

### 🛡️ **Systèmes de Protection Principaux**

- **🚨 Anti-Raid** : Détecte et bloque les joins massifs
- **� Anti-Spam** : Bloque les messages répétés
- **🔗 Anti-Discord Links** : Empêche les liens Discord uniquement
- **�💥 Anti-Nuke** : Protège contre la suppression de salons
- **🔨 Anti-Banall** : Empêche les bannissements massifs
- **🎭 Anti-Role Spam** : Limite la création de rôles
- **📢 Anti-Mass Mention** : Bloque les mentions excessives
- **� Anti-Caps** : Limite les majuscules
- **🚫 Anti-Bad Words** : Filtre les mots inappropriés

### 🎨 **Interface Professionnelle**

- **Couleur violette** uniforme (#8B008B)
- **Pas d'emojis superflus**
- **Messages simples et directs**
- **Embeds épurés**

### ⚙️ **Configuration**

- **Préfixe** : `&`
- **Token** : Via variable d'environnement
- **Logs** : Salons spécialisés automatiques
- **Rôles d'alerte** : Configurables par type

## � Installation

1. **Clonez le repository** :
```bash
git clone https://github.com/sunnysqlt/discord-protect-bot.git
cd discord-protect-bot
```

2. **Installez les dépendances** :
```bash
npm install
```

3. **Configurez le token** :
- Copiez `.env.example` vers `.env`
- Mettez votre token Discord dans `TOKEN=`

4. **Démarrez le bot** :
```bash
node bot.js
```

## 🚀 Hébergement

### **Nexus Hosting (Recommandé)**
- ✅ Vraiment gratuit 24/7
- ✅ Pas de timeout
- ✅ Discord OAuth
- Voir `hosting-guides/README-NEXUS.md`

### **Replit (Alternative)**
- ✅ Upload direct
- ⚠️ Peut s'endormir
- Voir `hosting-guides/README-REPLIT.md`

## 📋 Commandes

### **Protection du Serveur**
- `&help` - Affiche l'aide
- `&status` - État des protections
- `&lockdown` - Active le confinement
- `&unlockdown` - Désactive le confinement
- `&owner` - Informations propriétaire

### **Gestion des Logs**
- `&logs create` - Crée les salons de logs
- `&logs delete` - Supprime tous les logs
- `&logs setup` - Configuration automatique

### **Rôles d'Alerte**
- `&banall add <type> @role` - Ajoute un rôle d'alerte
- `&banall remove <type>` - Supprime un rôle d'alerte
- `&banall list` - Affiche les rôles configurés

### **Configuration des Protections**
- `&antiraid on/off/status` - Gère l'anti-raid
- `&antibanall on/off/status` - Gère l'anti-banall
- `&antinuke on/off/status` - Gère l'anti-nuke
- `&antispam on/off/status` - Gère l'anti-spam
- `&antilink on/off/status` - Gère l'anti-link Discord

## 🎯 Utilisation

1. **Créez les logs** : `&logs create`
2. **Configurez les rôles** : `&banall add raid @Admins`
3. **Vérifiez l'état** : `&status`
4. **Testez les protections** : Essayez de spammer

## 📊 Statistiques

- **15 systèmes de protection**
- **Serveur web intégré** (Express)
- **Compatible 24/7 gratuit**
- **Interface violette professionnelle**
- **0 emojis superflus**

## �️ Technologies

- **Node.js** - Runtime principal
- **Discord.js v14** - API Discord
- **Express** - Serveur web pour hébergement
- **dotenv** - Variables d'environnement

---

**🛡️ Protection Ultime - Votre serveur en sécurité 24/7 !**  - Modifiez `config.json` selon vos besoins
   - Définissez votre `ownerId` dans la configuration

3. **Démarrage** :
   ```bash
   npm start
   # ou utilisez start.bat sur Windows
   ```

## 🔧 Configuration des Logs

### **Création automatique**
```bash
&logs create    # Crée tous les salons de logs
&logs delete    # Supprime tous les salons de logs
&logs setup     # Configuration rapide
```

### **Salons créés automatiquement :**
- 🛡️ **LOGS DE PROTECTION** (catégorie)
  - 🚨 **raid-logs** - Tentatives de raid
  - 🔨 **ban-logs** - Bannissements massifs
  - 💥 **nuke-logs** - Tentatives de nuke
  - 📢 **spam-logs** - Spam et messages
  - 🔗 **link-logs** - Liens Discord
  - 🎭 **role-logs** - Créations de rôles
  - 📢 **mention-logs** - Mentions massives
  - 🔤 **moderation-logs** - Modération générale
  - 🔔 **alerts** - Alertes importantes

## 🚨 **Configuration des Rôles d'Alerte**

### **Ajouter des rôles d'alerte**
```bash
&banall add raid @Modérateurs      # Ping les modérateurs pour les raids
&banall add banall @Admins         # Ping les admins pour les banalls
&banall add nuke @Staff           # Ping le staff pour les nukes
```

### **Gérer les rôles**
```bash
&banall list           # Affiche tous les rôles configurés
&banall clear          # Supprime tous les rôles d'alerte
```

## 📊 **État du Système**

### **Commande status complète**
```bash
&status    # Affiche l'état de toutes les protections
```

Informations affichées :
- ✅/❌ État de chaque protection
- 📊 Limites et configurations
- 🚨 Rôles d'alerte configurés
- 📝 Salons de logs actifs
- ⚡ Performance du bot

## 🔧 **Configuration par Défaut**

### **Anti-Raid**
- Limite : 5 joins par minute
- Action : Lockdown + Bannissement
- Logs : 🚨-raid-logs

### **Anti-Banall**
- Limite : 3 bans en 30 secondes
- Action : Bannissement + Lockdown
- Logs : 🔨-ban-logs

### **Anti-Nuke**
- Limites : 3 salons / 5 rôles en 30s
- Action : Bannissement + Lockdown
- Logs : 💥-nuke-logs

### **Anti-Spam**
- Limite : 5 messages en 5 secondes
- Action : Mute 5 minutes + Suppression
- Logs : 📢-spam-logs

### **Anti-Discord Links**
- Cible : Liens Discord uniquement
- Domaines : discord.gg, discord.io, discord.me, etc.
- Action : Suppression + Avertissement
- Logs : 🔗-link-logs

### **Anti-Everyone**
- Cible : @everyone et @here
- Action : Suppression automatique
- Exceptions : Admins et Modérateurs

### **Anti-Zalgo**
- Cible : Textes avec caractères diacritiques
- Action : Suppression automatique
- Seuil : 5+ caractères zalgo

### **Anti-Emoji Spam**
- Limite : 10 emojis par message
- Action : Suppression automatique
- Types : Tous les emojis Unicode

### **Anti-Ghost Ping**
- Détection : Mentions supprimées en <10s
- Action : Logs + Avertissement
- Tracking : Mention et auteur

### **Anti-Image Spam**
- Limite : 3 images en 10 secondes
- Action : Mute 5 minutes + Suppression
- Types : Images, GIFs, stickers

### **Anti-New Account**
- Âge minimum : 24 heures
- Action : Monitoring et alertes
- Détection : À l'arrivée du membre

### **Anti-Selfbot**
- Cible : Selfbots et webhooks suspects
- Action : Bannissement immédiat
- Détection : Patterns suspects

## 💾 **Sauvegarde des Configurations**

Toutes les configurations sont sauvegardées dans `serverConfig.json` :
- Paramètres par serveur
- Historique des activations/désactivations
- Qui a modifié quoi et quand

## ⚠️ **Permissions Requises**

- **Administrateur** : Pour toutes les commandes de configuration
- **Gérer les messages** : Pour supprimer les messages
- **Bannir les membres** : Pour les protections anti-raid/banall
- **Gérer les rôles** : Pour les lockdowns et mutes
- **Voir les logs du serveur** : Pour la détection des menaces

## 🌟 **Points Forts**

- ✅ **15 systèmes de protection** différents
- ✅ **Configuration individuelle** de chaque protection
- ✅ **Logs détaillés** avec salons spécialisés
- ✅ **Alertes automatiques** avec pings de rôles
- ✅ **Interface intuitive** avec préfixe `&`
- ✅ **Sauvegarde persistente** des configurations
- ✅ **Détection avancée** des menaces
- ✅ **Performance optimisée** et stable

---

**🛡️ Bot de Protection Ultime v2.0 - Préfixe & - Protection 24/7**
=======
# discord-protect-bot
>>>>>>> 6b12acfbe19cc807f1050765df80e7010bb28628
