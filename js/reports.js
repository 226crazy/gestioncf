// Reports and Statistics Logic

let revenueChart, consoleChart, peakHoursChart, paymentChart;

document.addEventListener('DOMContentLoaded', () => {
    setDefaultDateRange();
    loadReports();

    document.getElementById('filterBtn').addEventListener('click', loadReports);
    document.getElementById('exportBtn').addEventListener('click', exportToSheets);
});

function setDefaultDateRange() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    document.getElementById('startDate').value = formatDateInput(startDate);
    document.getElementById('endDate').value = formatDateInput(endDate);
}

function formatDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

async function loadReports() {
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    endDate.setHours(23, 59, 59, 999);

    try {
        // Get sessions in date range
        const sessionsSnapshot = await db.collection('sessions')
            .where('startTime', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('startTime', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .get();

        const sessions = [];
        let totalRevenue = 0;

        sessionsSnapshot.forEach(doc => {
            const session = { id: doc.id, ...doc.data() };
            sessions.push(session);
            totalRevenue += session.totalAmount || 0;
        });

        // Get expenses in date range
        const expensesSnapshot = await db.collection('expenses')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .get();

        let totalExpenses = 0;
        expensesSnapshot.forEach(doc => {
            totalExpenses += doc.data().amount || 0;
        });

        const netProfit = totalRevenue - totalExpenses;

        // Update summary cards
        document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
        document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
        document.getElementById('netProfit').textContent = formatCurrency(netProfit);
        document.getElementById('totalSessions').textContent = sessions.length;

        // Generate charts
        generateRevenueChart(sessions, startDate, endDate);
        generateConsoleChart(sessions);
        generatePeakHoursChart(sessions);
        generatePaymentChart(sessions);

        // Populate tables
        populateSessionsTable(sessions);
        await populateElectricityTable(startDate, endDate);

    } catch (error) {
        console.error('Erreur lors du chargement des rapports:', error);
    }
}

function generateRevenueChart(sessions, startDate, endDate) {
    const dailyRevenue = {};

    // Initialize all days in range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateKey = formatDateKey(d);
        dailyRevenue[dateKey] = 0;
    }

    // Aggregate revenue by day
    sessions.forEach(session => {
        const dateKey = formatDateKey(session.startTime.toDate());
        dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (session.totalAmount || 0);
    });

    const labels = Object.keys(dailyRevenue).sort();
    const data = labels.map(label => dailyRevenue[label]);

    if (revenueChart) revenueChart.destroy();

    const ctx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Recettes (F)',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function generateConsoleChart(sessions) {
    const consoleUsage = {};

    sessions.forEach(session => {
        session.games?.forEach(game => {
            consoleUsage[game.console] = (consoleUsage[game.console] || 0) + 1;
        });
    });

    const labels = Object.keys(consoleUsage);
    const data = Object.values(consoleUsage);

    if (consoleChart) consoleChart.destroy();

    const ctx = document.getElementById('consoleChart').getContext('2d');
    consoleChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
                    '#10b981', '#3b82f6', '#ef4444'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function generatePeakHoursChart(sessions) {
    const hourlyUsage = new Array(24).fill(0);

    sessions.forEach(session => {
        const hour = session.startTime.toDate().getHours();
        hourlyUsage[hour]++;
    });

    const labels = Array.from({ length: 24 }, (_, i) => `${i}h`);

    if (peakHoursChart) peakHoursChart.destroy();

    const ctx = document.getElementById('peakHoursChart').getContext('2d');
    peakHoursChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre de sessions',
                data: hourlyUsage,
                backgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function generatePaymentChart(sessions) {
    const paymentMethods = { cash: 0, 'mobile-money': 0 };

    sessions.forEach(session => {
        if (session.isPaid) {
            paymentMethods[session.paymentMethod]++;
        }
    });

    if (paymentChart) paymentChart.destroy();

    const ctx = document.getElementById('paymentChart').getContext('2d');
    paymentChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cash', 'Mobile Money'],
            datasets: [{
                data: [paymentMethods.cash, paymentMethods['mobile-money']],
                backgroundColor: ['#10b981', '#3b82f6']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

function populateSessionsTable(sessions) {
    const tbody = document.getElementById('sessionsTableBody');

    if (sessions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-message">Aucune donnée disponible</td></tr>';
        return;
    }

    tbody.innerHTML = sessions.map(session => {
        const duration = calculateDuration(session.startTime.toDate(), session.endTime?.toDate());
        return `
            <tr>
                <td>${formatDate(session.startTime.toDate())}</td>
                <td>${session.customerName || 'Anonyme'}</td>
                <td>${session.games?.map(g => g.console).join(', ') || 'N/A'}</td>
                <td>${duration}</td>
                <td>${formatCurrency(session.totalAmount)}</td>
                <td>${session.paymentMethod === 'cash' ? 'Cash' : 'Mobile Money'}</td>
                <td><span class="session-status ${session.isPaid ? 'status-paid' : 'status-unpaid'}">
                    ${session.isPaid ? 'Payé' : 'Non payé'}
                </span></td>
            </tr>
        `;
    }).join('');
}

async function populateElectricityTable(startDate, endDate) {
    const tbody = document.getElementById('electricityTableBody');

    try {
        const electricitySnapshot = await db.collection('electricity')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .orderBy('date', 'desc')
            .get();

        if (electricitySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Aucune donnée disponible</td></tr>';
            return;
        }

        tbody.innerHTML = electricitySnapshot.docs.map(doc => {
            const data = doc.data();
            return `
                <tr>
                    <td>${formatDate(data.date.toDate())}</td>
                    <td>${data.meterValue.toFixed(2)} kWh</td>
                    <td>${data.consumption.toFixed(2)} kWh</td>
                    <td>${formatCurrency(data.cost)}</td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-message">Erreur lors du chargement</td></tr>';
    }
}

async function exportToSheets() {
    const btn = document.getElementById('exportBtn');
    const originalText = btn.textContent;
    btn.textContent = '⏳ Export en cours...';
    btn.disabled = true;

    try {
        // Get settings to check if Sheets is configured
        const settingsDoc = await db.collection('settings').doc('sheets').get();

        if (!settingsDoc.exists || !settingsDoc.data().sheetsUrl) {
            alert('Veuillez d\'abord configurer Google Sheets dans les paramètres');
            return;
        }

        // Prepare data for export
        const startDate = new Date(document.getElementById('startDate').value);
        const endDate = new Date(document.getElementById('endDate').value);
        endDate.setHours(23, 59, 59, 999);

        const sessionsSnapshot = await db.collection('sessions')
            .where('startTime', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('startTime', '<=', firebase.firestore.Timestamp.fromDate(endDate))
            .get();

        const sessions = sessionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Store export data in Firestore for backend processing
        await db.collection('exports').add({
            type: 'sessions',
            data: sessions,
            dateRange: { start: startDate, end: endDate },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });

        alert('Données préparées pour l\'export vers Google Sheets!\n\nNote: L\'intégration complète nécessite un backend. Consultez la documentation pour la configuration.');

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'export');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

function formatDateKey(date) {
    return date.toLocaleDateString('fr-FR');
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR');
}

function formatCurrency(amount) {
    return `${Math.round(amount).toLocaleString('fr-FR')} F`;
}

function calculateDuration(start, end) {
    if (!end) return 'En cours';

    const diff = end - start;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
}
