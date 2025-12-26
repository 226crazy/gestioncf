// Settings Management Logic

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();

    // Google Sheets
    document.getElementById('connectSheetsBtn').addEventListener('click', saveSheetSettings);
    document.getElementById('syncNowBtn').addEventListener('click', syncNowToSheets);

    // Pricing
    document.getElementById('savePricingBtn').addEventListener('click', savePricing);

    // Electricity
    document.getElementById('saveElectricityBtn').addEventListener('click', saveElectricitySetting);

    // Business Info
    document.getElementById('saveBusinessBtn').addEventListener('click', saveBusinessInfo);

    // Data Management
    document.getElementById('exportDataBtn').addEventListener('click', exportAllData);
    document.getElementById('backupBtn').addEventListener('click', createBackup);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
});

async function loadSettings() {
    try {
        // Load Sheets settings
        const sheetsDoc = await db.collection('settings').doc('sheets').get();
        if (sheetsDoc.exists) {
            const data = sheetsDoc.data();
            document.getElementById('sheetsUrl').value = data.sheetsUrl || '';
            document.getElementById('autoSync').checked = data.autoSync || false;
            updateSheetsStatus(data.lastSync);
        }

        // Load pricing settings
        const pricingDoc = await db.collection('settings').doc('pricing').get();
        if (pricingDoc.exists) {
            const pricing = pricingDoc.data();
            document.getElementById('ps4_option1').value = pricing['PS4-01']?.[0]?.price || 300;
            document.getElementById('ps4_option2').value = pricing['PS4-01']?.[1]?.price || 600;
            document.getElementById('ps5_option1').value = pricing['PS5-01']?.[0]?.price || 500;
            document.getElementById('ps5_option2').value = pricing['PS5-01']?.[1]?.price || 1000;
            document.getElementById('switch_price').value = pricing['Nintendo-Switch']?.[0]?.price || 500;
            document.getElementById('simulator_price').value = pricing['Simulateur']?.[0]?.price || 500;
            document.getElementById('vr_price').value = pricing['VR']?.[0]?.price || 500;
        }

        // Load electricity settings
        const electricityDoc = await db.collection('settings').doc('electricity').get();
        if (electricityDoc.exists) {
            document.getElementById('defaultKwhPrice').value = electricityDoc.data().pricePerKwh || 100;
        }

        // Load business info
        const businessDoc = await db.collection('settings').doc('business').get();
        if (businessDoc.exists) {
            const data = businessDoc.data();
            document.getElementById('businessName').value = data.name || '';
            document.getElementById('businessAddress').value = data.address || '';
            document.getElementById('businessPhone').value = data.phone || '';
        }

    } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
    }
}

async function saveSheetSettings() {
    const sheetsUrl = document.getElementById('sheetsUrl').value;
    const autoSync = document.getElementById('autoSync').checked;

    if (!sheetsUrl) {
        alert('Veuillez entrer l\'URL de votre Google Sheets');
        return;
    }

    try {
        await db.collection('settings').doc('sheets').set({
            sheetsUrl: sheetsUrl,
            autoSync: autoSync,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        updateSheetsStatus();
        alert('Paramètres Google Sheets enregistrés!\n\nNote: L\'intégration complète avec Google Sheets nécessite une configuration backend. Consultez la documentation pour plus de détails.');

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'enregistrement');
    }
}

async function syncNowToSheets() {
    const btn = document.getElementById('syncNowBtn');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Synchronisation...';
    btn.disabled = true;

    try {
        // Check if Sheets is configured
        const sheetsDoc = await db.collection('settings').doc('sheets').get();
        if (!sheetsDoc.exists || !sheetsDoc.data().sheetsUrl) {
            alert('Veuillez d\'abord configurer Google Sheets');
            return;
        }

        // Get all data
        const sessions = await db.collection('sessions').get();
        const expenses = await db.collection('expenses').get();
        const electricity = await db.collection('electricity').get();

        // Prepare export data
        const exportData = {
            sessions: sessions.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            expenses: expenses.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            electricity: electricity.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            exportedAt: new Date().toISOString()
        };

        // Store for backend processing
        await db.collection('exports').add({
            type: 'full_sync',
            data: exportData,
            status: 'pending',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update last sync time
        await db.collection('settings').doc('sheets').update({
            lastSync: firebase.firestore.FieldValue.serverTimestamp()
        });

        updateSheetsStatus(new Date());
        alert('Synchronisation préparée!\n\nLes données sont prêtes à être exportées vers Google Sheets.\n\nNote: L\'intégration complète nécessite un backend. Consultez la documentation.');

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la synchronisation');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function updateSheetsStatus(lastSync) {
    const statusDiv = document.getElementById('sheetsStatus');

    if (lastSync) {
        const syncDate = lastSync.toDate ? lastSync.toDate() : new Date(lastSync);
        statusDiv.innerHTML = `<strong>Dernière synchronisation:</strong> ${syncDate.toLocaleString('fr-FR')}`;
        statusDiv.style.display = 'block';
    } else {
        statusDiv.innerHTML = '<strong>Google Sheets configuré</strong> - Prêt pour la synchronisation';
        statusDiv.style.display = 'block';
    }
}

async function savePricing() {
    const pricing = {
        'PS4-01': [
            { label: '1 Match FC26 / 15min Aventure', price: parseFloat(document.getElementById('ps4_option1').value) },
            { label: '2 Matchs FC26 / 30min Aventure', price: parseFloat(document.getElementById('ps4_option2').value) }
        ],
        'PS4-02': [
            { label: '1 Match FC26 / 15min Aventure', price: parseFloat(document.getElementById('ps4_option1').value) },
            { label: '2 Matchs FC26 / 30min Aventure', price: parseFloat(document.getElementById('ps4_option2').value) }
        ],
        'PS5-01': [
            { label: '1 Match FC26 / 10min Aventure', price: parseFloat(document.getElementById('ps5_option1').value) },
            { label: '3 Matchs FC26 / 30min Aventure', price: parseFloat(document.getElementById('ps5_option2').value) }
        ],
        'PS5-02': [
            { label: '1 Match FC26 / 10min Aventure', price: parseFloat(document.getElementById('ps5_option1').value) },
            { label: '3 Matchs FC26 / 30min Aventure', price: parseFloat(document.getElementById('ps5_option2').value) }
        ],
        'Nintendo-Switch': [
            { label: '15 Minutes', price: parseFloat(document.getElementById('switch_price').value) }
        ],
        'Simulateur': [
            { label: '15 Minutes', price: parseFloat(document.getElementById('simulator_price').value) }
        ],
        'VR': [
            { label: '15 Minutes', price: parseFloat(document.getElementById('vr_price').value) }
        ]
    };

    try {
        await db.collection('settings').doc('pricing').set(pricing);

        // Update global PRICING object
        Object.assign(PRICING, pricing);

        alert('Prix enregistrés avec succès!');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'enregistrement des prix');
    }
}

async function saveElectricitySetting() {
    const pricePerKwh = parseFloat(document.getElementById('defaultKwhPrice').value);

    try {
        await db.collection('settings').doc('electricity').set({
            pricePerKwh: pricePerKwh,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        alert('Paramètre électricité enregistré!');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'enregistrement');
    }
}

async function saveBusinessInfo() {
    const businessInfo = {
        name: document.getElementById('businessName').value,
        address: document.getElementById('businessAddress').value,
        phone: document.getElementById('businessPhone').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        await db.collection('settings').doc('business').set(businessInfo);
        alert('Informations enregistrées!');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'enregistrement');
    }
}

async function exportAllData() {
    try {
        const sessions = await db.collection('sessions').get();
        const expenses = await db.collection('expenses').get();
        const electricity = await db.collection('electricity').get();
        const settings = await db.collection('settings').get();

        const exportData = {
            sessions: sessions.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            expenses: expenses.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            electricity: electricity.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            settings: settings.docs.map(doc => ({ id: doc.id, ...doc.data() })),
            exportDate: new Date().toISOString()
        };

        // Download as JSON
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gaming-room-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        alert('Données exportées avec succès!');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'export des données');
    }
}

async function createBackup() {
    if (!confirm('Créer une sauvegarde de toutes les données ?')) {
        return;
    }

    try {
        await exportAllData();

        // Save backup record
        await db.collection('backups').add({
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.currentUser.uid
        });

        alert('Sauvegarde créée! Le fichier a été téléchargé.');
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la création de la sauvegarde');
    }
}

async function clearAllData() {
    const confirmation = prompt('⚠️ ATTENTION! Cette action est IRRÉVERSIBLE!\n\nToutes vos données (sessions, dépenses, compteur électrique) seront définitivement supprimées.\n\nTapez "SUPPRIMER" en majuscules pour confirmer:');

    if (confirmation !== 'SUPPRIMER') {
        alert('Suppression annulée');
        return;
    }

    const secondConfirmation = confirm('Êtes-vous ABSOLUMENT sûr ? Cette action ne peut pas être annulée!');

    if (!secondConfirmation) {
        alert('Suppression annulée');
        return;
    }

    try {
        // Create backup before clearing
        await exportAllData();

        // Delete all collections
        const collections = ['sessions', 'expenses', 'electricity', 'exports', 'backups'];

        for (const collectionName of collections) {
            const snapshot = await db.collection(collectionName).get();
            const batch = db.batch();

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });

            await batch.commit();
        }

        alert('Toutes les données ont été supprimées. Un export de sauvegarde a été téléchargé.');
        window.location.reload();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression des données');
    }
}
