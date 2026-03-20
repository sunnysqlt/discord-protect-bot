# 🛡️ Bot Discord de Protection Ultime

Un bot Discord complet et avancé conçu pour protéger votre serveur contre toutes les menaces possibles avec un préfixe `&`.

## 🚀 Fonctionnalités

### 🛡️ **Systèmes de Protection Principaux**

- **🚨 Anti-Raid** : Détecte et bloque les joins massifs
- **💥 Anti-Nuke** : Protège contre la suppression de salons/roles
- **🔨 Anti-Banall** : Empêche les bannissements massifs
- **🎭 Anti-Role Spam** : Limite la création de rôles
- **📢 Anti-Spam** : Bloque les messages répétés
- **🔗 Anti-Discord Links** : Empêche les liens Discord uniquement

### 🛡️ **Protections Avancées**

- **📢 Anti-Everyone** : Bloque les mentions @everyone/@here
- **🌀 Anti-Zalgo** : Empêche les textes avec caractères zalgo
- **😀 Anti-Emoji Spam** : Limite le spam d'emojis
- **👻 Anti-Ghost Ping** : Détecte les mentions supprimées
- **🖼️ Anti-Image Spam** : Limite le spam d'images/GIFs/stickers
- **🆕 Anti-New Account** : Surveille les nouveaux comptes (<24h)
- **🤖 Anti-Selfbot** : Détecte les selfbots et webhooks suspects

### ⚙️ **Commandes Administratives**

- `&lockdown` / `&unlockdown` - Mode confinement
- `&status` - État complet des protections
- `&owner` - Informations du propriétaire
- `&logs create/delete/setup` - Gestion des logs
- `&banall add/remove/list/clear` - Rôles d'alerte

### 🔧 **Configuration Individuelle**

Chaque protection peut être activée/désactivée individuellement :
- `&antiraid on/off/status`
- `&antibanall on/off/status`
- `&antinuke on/off/status`
- `&antispam on/off/status`
- `&antilink on/off/status`
- `&antieveryone on/off/status`
- `&antizalgo on/off/status`
- `&antiemoji on/off/status`
- `&antighostping on/off/status`
- `&antiimage on/off/status`
- `&antinewaccount on/off/status`
- `&antiselfbot on/off/status`

## 📋 Installation

1. **Installation des dépendances** :
   ```bash
   npm install
   ```

2. **Configuration du bot** :
   - Configurez `.env` avec votre token Discord
   - Modifiez `config.json` selon vos besoins
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
