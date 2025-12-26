# 🎮 Gestion Salle de Jeux - Application Web

Application web complète pour gérer une salle de jeux avec suivi des sessions, comptabilité, et rapports.

## ✨ Fonctionnalités

- 🔐 **Authentification multi-gérants** - Système de connexion sécurisé
- 🎯 **Gestion des sessions** - Enregistrement des parties avec différentes consoles
- 💰 **Gestion des paiements** - Cash et Mobile Money
- 📊 **Rapports détaillés** - Statistiques, graphiques, et analyses
- ⚡ **Suivi électricité** - Enregistrement du compteur et calcul de consommation
- 💸 **Gestion des dépenses** - Loyer, salaire, électricité, WiFi, etc.
- 📈 **Tableaux de bord** - Vue d'ensemble en temps réel
- 📱 **Design responsive** - Fonctionne sur mobile et desktop
- 📋 **Export Google Sheets** - Synchronisation automatique des données
- 🔥 **Base de données Firebase** - Gratuite et sécurisée

## 🚀 Démarrage Rapide

### 1. Cloner le projet

```bash
git clone https://github.com/VOTRE-USERNAME/gaming-room-manager.git
cd gaming-room-manager
```

### 2. Configuration Firebase

1. Créez un compte gratuit sur [Firebase](https://console.firebase.google.com/)
2. Créez un nouveau projet
3. Activez **Authentication** avec Email/Password
4. Créez une base de données **Firestore** en mode test
5. Copiez votre configuration Firebase
6. Remplacez la configuration dans `js/config.js`

Consultez le fichier `SETUP_GUIDE.md` pour les instructions détaillées.

### 3. Déploiement sur GitHub Pages

1. Créez un nouveau repository sur GitHub
2. Poussez votre code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/VOTRE-USERNAME/gaming-room-manager.git
git push -u origin main
```

3. Activez GitHub Pages:
   - Allez dans **Settings** > **Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **root**
   - Cliquez sur **Save**

4. Votre application sera disponible à: `https://VOTRE-USERNAME.github.io/gaming-room-manager/`

## 📋 Configuration des Prix

Les prix des consoles sont configurables dans l'application:

- **PS4 (01 et 02)**:
  - 1 Match FC26 / 15min Aventure: 300 F
  - 2 Matchs FC26 / 30min Aventure: 600 F

- **PS5 (01 et 02)**:
  - 1 Match FC26 / 10min Aventure: 500 F
  - 3 Matchs FC26 / 30min Aventure: 1000 F

- **Nintendo Switch**: 15 Minutes - 500 F
- **Simulateur de Course**: 15 Minutes - 500 F
- **Réalité Virtuelle**: 15 Minutes - 500 F

## 📊 Structure du Projet

```
gaming-room-manager/
├── index.html              # Page de connexion
├── dashboard.html          # Tableau de bord
├── sessions.html           # Enregistrement des sessions
├── reports.html            # Rapports et statistiques
├── expenses.html           # Gestion des dépenses
├── settings.html           # Paramètres
├── css/
│   └── style.css          # Styles CSS
├── js/
│   ├── config.js          # Configuration Firebase
│   ├── auth.js            # Authentification
│   ├── auth-check.js      # Vérification authentification
│   ├── dashboard.js       # Logique tableau de bord
│   ├── sessions.js        # Gestion des sessions
│   ├── reports.js         # Rapports et statistiques
│   ├── expenses.js        # Gestion des dépenses
│   └── settings.js        # Paramètres
└── README.md
```

## 🔧 Technologies Utilisées

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase (Firestore, Authentication)
- **Graphiques**: Chart.js
- **Hébergement**: GitHub Pages (Gratuit)
- **Base de données**: Firestore (Gratuit jusqu'à 50K lectures/jour)

## 📱 Utilisation

### Créer un Compte Gérant

1. Ouvrez l'application
2. Cliquez sur "Créer un compte"
3. Remplissez vos informations
4. Connectez-vous

### Enregistrer une Session

1. Allez dans "Nouvelle Session"
2. Entrez les informations du client (optionnel)
3. Sélectionnez la console et le type de jeu
4. Ajoutez plusieurs jeux si nécessaire
5. Définissez l'heure de fin
6. Sélectionnez le mode de paiement
7. Enregistrez

### Enregistrer le Compteur Électrique

1. Sur le tableau de bord, cliquez "Enregistrer Compteur"
2. Entrez la valeur actuelle
3. La consommation est calculée automatiquement
4. Le coût est ajouté aux dépenses

### Voir les Rapports

1. Allez dans "Rapports"
2. Sélectionnez la période
3. Consultez les statistiques et graphiques
4. Exportez vers Google Sheets

## 🔒 Sécurité

- Authentification sécurisée par Firebase
- Règles de sécurité Firestore recommandées
- Pas de données sensibles côté client
- Sessions sécurisées

## 🆘 Support

Pour toute question ou problème:

1. Consultez `SETUP_GUIDE.md`
2. Vérifiez votre configuration Firebase
3. Consultez la console Firebase pour les erreurs

## 📄 Licence

Ce projet est libre d'utilisation pour votre salle de jeux.

## 🌟 Améliorations Futures

- [ ] Application mobile native
- [ ] Système de réservations
- [ ] Programme de fidélité
- [ ] Notifications SMS
- [ ] Rapports PDF
- [ ] Multi-devises

## 👨‍💻 Développement

Créé avec ❤️ pour faciliter la gestion des salles de jeux.

---

**Note**: Firebase gratuit offre:
- 50,000 lectures/jour
- 20,000 écritures/jour
- 20,000 suppressions/jour
- 1 GB stockage

C'est largement suffisant pour une salle de jeux avec activité modérée.
