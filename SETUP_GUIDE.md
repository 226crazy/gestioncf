# 📚 Guide de Configuration - Gestion Salle de Jeux

Ce guide vous accompagne étape par étape pour configurer votre application de gestion de salle de jeux.

## 📋 Prérequis

- Un compte Google (gratuit)
- Un compte GitHub (gratuit)
- Un navigateur web moderne
- Connexion internet

## 🔥 Étape 1: Configuration Firebase

### 1.1 Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Ajouter un projet"
3. Donnez un nom à votre projet (ex: "ma-salle-de-jeux")
4. Désactivez Google Analytics (optionnel pour ce projet)
5. Cliquez sur "Créer le projet"

### 1.2 Activer l'Authentification

1. Dans le menu latéral, cliquez sur "Authentication"
2. Cliquez sur "Commencer"
3. Cliquez sur "Email/Password"
4. Activez "Email/Password"
5. Cliquez sur "Enregistrer"

### 1.3 Créer une Base de Données Firestore

1. Dans le menu latéral, cliquez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Sélectionnez "Démarrer en mode test" (ou mode production avec les règles ci-dessous)
4. Choisissez un emplacement proche (ex: europe-west)
5. Cliquez sur "Activer"

### 1.4 Configurer les Règles de Sécurité Firestore

Dans l'onglet "Règles" de Firestore, remplacez par:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonction pour vérifier si l'utilisateur est connecté
    function isSignedIn() {
      return request.auth != null;
    }

    // Collection managers - lecture/écriture pour utilisateurs connectés
    match /managers/{managerId} {
      allow read, write: if isSignedIn();
    }

    // Collection sessions - lecture/écriture pour utilisateurs connectés
    match /sessions/{sessionId} {
      allow read, write: if isSignedIn();
    }

    // Collection expenses - lecture/écriture pour utilisateurs connectés
    match /expenses/{expenseId} {
      allow read, write: if isSignedIn();
    }

    // Collection electricity - lecture/écriture pour utilisateurs connectés
    match /electricity/{electricityId} {
      allow read, write: if isSignedIn();
    }

    // Collection settings - lecture/écriture pour utilisateurs connectés
    match /settings/{settingId} {
      allow read, write: if isSignedIn();
    }

    // Collection exports - lecture/écriture pour utilisateurs connectés
    match /exports/{exportId} {
      allow read, write: if isSignedIn();
    }

    // Collection backups - lecture/écriture pour utilisateurs connectés
    match /backups/{backupId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

Cliquez sur "Publier"

### 1.5 Obtenir la Configuration Firebase

1. Cliquez sur l'icône d'engrenage ⚙️ > "Paramètres du projet"
2. Faites défiler jusqu'à "Vos applications"
3. Cliquez sur l'icône web `</>`
4. Donnez un surnom à votre application (ex: "gaming-room-web")
5. Ne cochez PAS "Configurer Firebase Hosting"
6. Cliquez sur "Enregistrer l'application"
7. Copiez l'objet `firebaseConfig`

### 1.6 Configurer votre Application

1. Ouvrez le fichier `js/config.js`
2. Remplacez les valeurs par votre configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIza...", // Votre API Key
    authDomain: "votre-projet.firebaseapp.com",
    projectId: "votre-projet",
    storageBucket: "votre-projet.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

3. Enregistrez le fichier

## 🐙 Étape 2: Déploiement sur GitHub

### 2.1 Créer un Repository GitHub

1. Connectez-vous à [GitHub](https://github.com)
2. Cliquez sur le bouton "+" en haut à droite
3. Sélectionnez "New repository"
4. Nom: `gaming-room-manager` (ou autre nom)
5. Description: "Application de gestion de salle de jeux"
6. Visibilité: **Public** (obligatoire pour GitHub Pages gratuit)
7. Ne cochez RIEN d'autre
8. Cliquez sur "Create repository"

### 2.2 Pousser votre Code

Ouvrez un terminal dans le dossier du projet et exécutez:

```bash
# Initialiser Git
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "🎮 Application de gestion de salle de jeux"

# Renommer la branche en main
git branch -M main

# Lier au repository GitHub (remplacez USERNAME et REPO)
git remote add origin https://github.com/USERNAME/gaming-room-manager.git

# Pousser le code
git push -u origin main
```

### 2.3 Activer GitHub Pages

1. Allez sur votre repository GitHub
2. Cliquez sur "Settings"
3. Dans le menu latéral, cliquez sur "Pages"
4. Sous "Source", sélectionnez:
   - Branch: `main`
   - Folder: `/ (root)`
5. Cliquez sur "Save"
6. Attendez 1-2 minutes
7. Votre application sera disponible à: `https://USERNAME.github.io/gaming-room-manager/`

## 📊 Étape 3: Configuration Google Sheets (Optionnel)

### 3.1 Créer une Feuille Google

1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez une nouvelle feuille
3. Nommez-la "Gaming Room Data"

### 3.2 Créer les Onglets

Créez ces onglets:
- **Sessions**: Pour les sessions de jeu
- **Dépenses**: Pour les dépenses
- **Électricité**: Pour le suivi électrique
- **Statistiques**: Pour les résumés

### 3.3 En-têtes des Colonnes

**Onglet Sessions:**
- Date | Client | Téléphone | Console | Type de Jeu | Début | Fin | Durée | Montant | Paiement | Payé

**Onglet Dépenses:**
- Date | Type | Description | Fréquence | Montant

**Onglet Électricité:**
- Date | Compteur | Consommation | Prix/kWh | Coût Total

### 3.4 Configuration dans l'Application

1. Copiez l'URL de votre feuille Google
2. Dans l'application, allez dans "Paramètres"
3. Collez l'URL dans "URL Google Sheets"
4. Activez "Synchronisation automatique" si souhaité
5. Cliquez sur "Connecter Google Sheets"

**Note:** L'intégration complète Google Sheets nécessite un backend (Google Apps Script ou Cloud Functions). Pour l'instant, vous pouvez exporter manuellement les données.

### 3.5 Script Google Apps Script (Avancé)

Pour automatiser l'import, créez un Google Apps Script:

1. Dans Google Sheets, cliquez sur "Extensions" > "Apps Script"
2. Collez ce code:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);

  // Ajouter aux onglets appropriés selon data.type
  // ... (code d'insertion)

  return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Déployez comme Web App
4. Utilisez l'URL dans votre application

## ✅ Étape 4: Premiers Pas

### 4.1 Créer votre Premier Compte

1. Ouvrez votre application
2. Cliquez sur "Créer un compte"
3. Remplissez:
   - Nom complet: Votre nom
   - Email: Votre email
   - Mot de passe: Minimum 6 caractères
4. Cliquez sur "Créer le compte"

### 4.2 Configurer les Paramètres

1. Allez dans "Paramètres"
2. Configurez:
   - **Informations de l'entreprise**: Nom, adresse, téléphone
   - **Prix des consoles**: Ajustez selon vos tarifs
   - **Prix kWh**: Votre tarif électrique

### 4.3 Enregistrer une Session Test

1. Allez dans "Nouvelle Session"
2. Remplissez les informations
3. Sélectionnez une console et un jeu
4. Enregistrez

### 4.4 Ajouter une Dépense Test

1. Allez dans "Dépenses"
2. Ajoutez une dépense (ex: loyer)
3. Enregistrez

### 4.5 Consulter le Tableau de Bord

1. Retournez au "Tableau de Bord"
2. Vérifiez que vos données apparaissent
3. Consultez les statistiques

## 🔧 Dépannage

### Erreur: "Firebase not defined"

- Vérifiez que vous avez bien configuré `js/config.js`
- Vérifiez que les scripts Firebase sont chargés dans le HTML

### Erreur: "Permission denied"

- Vérifiez les règles de sécurité Firestore
- Vérifiez que vous êtes connecté

### L'application ne s'affiche pas sur GitHub Pages

- Attendez quelques minutes après activation
- Vérifiez que la branche et le dossier sont corrects
- Vérifiez que le repository est public

### Les données ne s'enregistrent pas

- Ouvrez la console du navigateur (F12)
- Vérifiez les erreurs
- Vérifiez votre connexion internet
- Vérifiez Firebase Console > Firestore

## 💡 Conseils d'Utilisation

1. **Sauvegardez régulièrement** vos données (bouton dans Paramètres)
2. **Enregistrez le compteur** chaque jour pour un suivi précis
3. **Ajoutez les dépenses** dès qu'elles surviennent
4. **Consultez les rapports** chaque semaine pour optimiser
5. **Créez plusieurs comptes gérants** pour partager la gestion

## 📞 Support

Si vous rencontrez des problèmes:

1. Consultez la console Firebase pour les erreurs
2. Vérifiez la console du navigateur (F12)
3. Relisez ce guide attentivement
4. Vérifiez que Firebase est bien configuré

## 🎉 Félicitations!

Votre application est maintenant configurée et prête à l'emploi!

Profitez de votre nouvelle application de gestion de salle de jeux! 🎮
