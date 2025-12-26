// Firebase Configuration
// IMPORTANT: Remplacez ces valeurs par votre propre configuration Firebase
// Pour obtenir votre configuration:
// 1. Allez sur https://console.firebase.google.com/
// 2. Créez un nouveau projet (gratuit)
// 3. Activez Authentication (Email/Password)
// 4. Créez une base de données Firestore
// 5. Copiez votre configuration ici

const firebaseConfig = {
  apiKey: "AIzaSyCZVKBMQg3T5fiUC5d5kl2O8HpeUjMzCJI",
  authDomain: "ma-salle-de-jeux.firebaseapp.com",
  projectId: "ma-salle-de-jeux",
  storageBucket: "ma-salle-de-jeux.firebasestorage.app",
  messagingSenderId: "31882568488",
  appId: "1:31882568488:web:02540072878fbb0a1fe61d",
  measurementId: "G-8X0KT4084B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Configuration des prix par défaut
const PRICING = {
    'PS4-01': [
        { label: '1 Match FC26 / 15min Aventure', price: 300 },
        { label: '2 Matchs FC26 / 30min Aventure', price: 600 }
    ],
    'PS4-02': [
        { label: '1 Match FC26 / 15min Aventure', price: 300 },
        { label: '2 Matchs FC26 / 30min Aventure', price: 600 }
    ],
    'PS5-01': [
        { label: '1 Match FC26 / 10min Aventure', price: 500 },
        { label: '3 Matchs FC26 / 30min Aventure', price: 1000 }
    ],
    'PS5-02': [
        { label: '1 Match FC26 / 10min Aventure', price: 500 },
        { label: '3 Matchs FC26 / 30min Aventure', price: 1000 }
    ],
    'Nintendo-Switch': [
        { label: '15 Minutes', price: 500 }
    ],
    'Simulateur': [
        { label: '15 Minutes', price: 500 }
    ],
    'VR': [
        { label: '15 Minutes', price: 500 }
    ]
};

// Fonction pour charger la configuration des prix depuis Firestore
async function loadPricing() {
    try {
        const doc = await db.collection('settings').doc('pricing').get();
        if (doc.exists) {
            const customPricing = doc.data();
            Object.assign(PRICING, customPricing);
        }
    } catch (error) {
        console.log('Utilisation des prix par défaut');
    }
}

// Charger les prix au démarrage
loadPricing();
