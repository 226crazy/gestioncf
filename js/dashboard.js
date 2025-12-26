// Dashboard Logic

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
    setupMeterModal();

    // Set current date
    const currentDate = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentDate').textContent = currentDate;
});

async function loadDashboardData() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Get today's sessions
        const todaySessionsSnapshot = await db.collection('sessions')
            .where('startTime', '>=', today)
            .get();

        let todayRevenue = 0;
        let activeSessions = 0;
        const recentSessions = [];

        todaySessionsSnapshot.forEach(doc => {
            const session = doc.data();
            todayRevenue += session.totalAmount || 0;

            if (!session.endTime || session.endTime.toDate() > new Date()) {
                activeSessions++;
            }

            recentSessions.push({ id: doc.id, ...session });
        });

        // Get month's data for profit calculation
        const monthSessionsSnapshot = await db.collection('sessions')
            .where('startTime', '>=', startOfMonth)
            .get();

        let monthRevenue = 0;
        monthSessionsSnapshot.forEach(doc => {
            monthRevenue += doc.data().totalAmount || 0;
        });

        const monthExpensesSnapshot = await db.collection('expenses')
            .where('date', '>=', startOfMonth)
            .get();

        let monthExpenses = 0;
        monthExpensesSnapshot.forEach(doc => {
            monthExpenses += doc.data().amount || 0;
        });

        const monthProfit = monthRevenue - monthExpenses;

        // Update UI
        document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue);
        document.getElementById('todaySessions').textContent = todaySessionsSnapshot.size;
        document.getElementById('activeConsoles').textContent = activeSessions;
        document.getElementById('monthProfit').textContent = formatCurrency(monthProfit);

        // Display active and recent sessions
        displayActiveSessions(recentSessions.filter(s => !s.endTime || s.endTime.toDate() > new Date()));
        displayRecentSessions(recentSessions.sort((a, b) => b.startTime - a.startTime).slice(0, 5));

    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
}

function displayActiveSessions(sessions) {
    const container = document.getElementById('activeSessions');

    if (sessions.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune session active</p>';
        return;
    }

    container.innerHTML = sessions.map(session => `
        <div class="session-card">
            <div class="session-header">
                <strong>${session.customerName || 'Client Anonyme'}</strong>
                <span class="session-status status-active">En cours</span>
            </div>
            <div class="session-info">
                <div><strong>Console:</strong> ${session.games?.[0]?.console || 'N/A'}</div>
                <div><strong>Début:</strong> ${formatDateTime(session.startTime.toDate())}</div>
                <div><strong>Montant:</strong> ${formatCurrency(session.totalAmount)}</div>
            </div>
        </div>
    `).join('');
}

function displayRecentSessions(sessions) {
    const container = document.getElementById('recentSessions');

    if (sessions.length === 0) {
        container.innerHTML = '<p class="empty-message">Aucune session récente</p>';
        return;
    }

    container.innerHTML = sessions.map(session => {
        const isPaid = session.isPaid;
        const isCompleted = session.endTime && session.endTime.toDate() <= new Date();

        return `
            <div class="session-card">
                <div class="session-header">
                    <strong>${session.customerName || 'Client Anonyme'}</strong>
                    <div>
                        <span class="session-status ${isCompleted ? 'status-completed' : 'status-active'}">
                            ${isCompleted ? 'Terminée' : 'En cours'}
                        </span>
                        <span class="session-status ${isPaid ? 'status-paid' : 'status-unpaid'}">
                            ${isPaid ? 'Payé' : 'Non payé'}
                        </span>
                    </div>
                </div>
                <div class="session-info">
                    <div><strong>Console:</strong> ${session.games?.[0]?.console || 'N/A'}</div>
                    <div><strong>Début:</strong> ${formatTime(session.startTime.toDate())}</div>
                    <div><strong>Montant:</strong> ${formatCurrency(session.totalAmount)}</div>
                    <div><strong>Paiement:</strong> ${session.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'}</div>
                </div>
            </div>
        `;
    }).join('');
}

function setupMeterModal() {
    const modal = document.getElementById('meterModal');
    const btn = document.getElementById('addMeterBtn');
    const span = document.getElementsByClassName('close')[0];
    const form = document.getElementById('meterForm');

    btn.onclick = async function() {
        // Get last meter reading
        try {
            const lastMeterDoc = await db.collection('electricity')
                .orderBy('date', 'desc')
                .limit(1)
                .get();

            if (!lastMeterDoc.empty) {
                const lastMeter = lastMeterDoc.docs[0].data();
                document.getElementById('consumptionInfo').innerHTML = `
                    <strong>Dernière lecture:</strong> ${lastMeter.meterValue} kWh le ${formatDate(lastMeter.date.toDate())}
                `;
            }
        } catch (error) {
            console.log('Aucune lecture précédente');
        }

        modal.style.display = 'block';
    }

    span.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    form.onsubmit = async function(e) {
        e.preventDefault();

        const meterValue = parseFloat(document.getElementById('meterValue').value);
        const pricePerKwh = parseFloat(document.getElementById('pricePerKwh').value);

        try {
            // Get last meter reading to calculate consumption
            const lastMeterDoc = await db.collection('electricity')
                .orderBy('date', 'desc')
                .limit(1)
                .get();

            let consumption = 0;
            let cost = 0;

            if (!lastMeterDoc.empty) {
                const lastMeter = lastMeterDoc.docs[0].data();
                consumption = meterValue - lastMeter.meterValue;
                cost = consumption * pricePerKwh;
            }

            // Save meter reading
            await db.collection('electricity').add({
                meterValue: meterValue,
                pricePerKwh: pricePerKwh,
                consumption: consumption,
                cost: cost,
                date: firebase.firestore.FieldValue.serverTimestamp(),
                recordedBy: auth.currentUser.uid
            });

            // If there's consumption, add it as an expense
            if (cost > 0) {
                await db.collection('expenses').add({
                    type: 'electricite',
                    amount: cost,
                    date: firebase.firestore.FieldValue.serverTimestamp(),
                    frequency: 'unique',
                    description: `Consommation électrique: ${consumption.toFixed(2)} kWh`,
                    createdBy: auth.currentUser.uid
                });
            }

            alert('Compteur enregistré avec succès!');
            modal.style.display = 'none';
            form.reset();
            loadDashboardData();

        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'enregistrement du compteur');
        }
    }
}

function formatCurrency(amount) {
    return `${Math.round(amount).toLocaleString('fr-FR')} F`;
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR');
}

function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
    return `${formatDate(date)} ${formatTime(date)}`;
}
