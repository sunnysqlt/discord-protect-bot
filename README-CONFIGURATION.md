# 📋 Guide de Configuration du Bot

## 🚀 Commandes de Configuration

### 🛡️ **Anti-Raid**
```bash
!antiraid on      # Active la protection anti-raid
!antiraid off     # Désactive la protection anti-raid
!antiraid status  # Affiche l'état actuel
```

### 🔨 **Anti-Banall**
```bash
!antibanall on      # Active la protection anti-banall
!antibanall off     # Désactive la protection anti-banall
!antibanall status  # Affiche l'état actuel
```

### 💥 **Anti-Nuke**
```bash
!antinuke on      # Active la protection anti-nuke
!antinuke off     # Désactive la protection anti-nuke
!antinuke status  # Affiche l'état actuel
```

### 📢 **Anti-Spam**
```bash
!antispam on      # Active la protection anti-spam
!antispam off     # Désactive la protection anti-spam
!antispam status  # Affiche l'état actuel
```

### 🔗 **Anti-Link Discord**
```bash
!antilink on      # Active la protection anti-link Discord
!antilink off     # Désactive la protection anti-link Discord
!antilink status  # Affiche l'état actuel
```

## 📝 **Gestion des Logs**

### **Création automatique**
```bash
!logs create    # Crée tous les salons de logs
!logs delete    # Supprime tous les salons de logs
!logs setup     # Configuration rapide
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
!banall add raid @Modérateurs      # Ping les modérateurs pour les raids
!banall add banall @Admins         # Ping les admins pour les banalls
!banall add nuke @Staff           # Ping le staff pour les nukes
```

### **Gérer les rôles**
```bash
!banall remove raid     # Supprime le rôle d'alerte raid
!banall remove banall  # Supprime le rôle d'alerte banall
!banall remove nuke    # Supprime le rôle d'alerte nuke
!banall list           # Affiche tous les rôles configurés
!banall clear          # Supprime tous les rôles d'alerte
```

## 📊 **État du Système**

### **Commande status complète**
```bash
!status    # Affiche l'état de toutes les protections
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

### **Anti-Link Discord**
- Cible : Liens Discord uniquement
- Domaines : discord.gg, discord.io, discord.me, etc.
- Action : Suppression + Avertissement
- Logs : 🔗-link-logs

## 💾 **Sauvegarde des Configurations**

Toutes les configurations sont sauvegardées dans `serverConfig.json` :
- Paramètres par serveur
- Historique des activations/désactivations
- Qui a modifié quoi et quand

## ⚠️ **Notes Importantes**

1. **Permissions requises** : Administrateur pour toutes les commandes de configuration
2. **Logs automatiques** : Chaque modification est logguée
3. **Rôles d'alerte** : Ping automatique pour RAID, BANALL, NUKE
4. **Configuration persistente** : Les paramètres sont sauvegardés même après redémarrage

---

**🛡️ Bot de Protection Ultime - Configuration Complète**
