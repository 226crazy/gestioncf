// Expenses Management Logic

document.addEventListener('DOMContentLoaded', () => {
    loadExpensesSummary();
    loadExpensesList();

    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('filterExpensesBtn').addEventListener('click', loadExpensesList);
});

async function handleExpenseSubmit(e) {
    e.preventDefault();

    const expenseData = {
        type: document.getElementById('expenseType').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        date: firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('expenseDate').value)),
        frequency: document.getElementById('expenseFrequency').value,
        description: document.getElementById('expenseDescription').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser.uid
    };

    try {
        await db.collection('expenses').add(expenseData);

        // Sync to Google Sheets if enabled
        await syncToSheets('expenses', expenseData);

        alert('Dépense ajoutée avec succès!');
        document.getElementById('expenseForm').reset();

        loadExpensesSummary();
        loadExpensesList();

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout de la dépense');
    }
}

async function loadExpensesSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    try {
        // Month expenses
        const monthExpenses = await db.collection('expenses')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
            .get();

        let monthTotal = 0;
        monthExpenses.forEach(doc => {
            monthTotal += doc.data().amount || 0;
        });

        // Week expenses
        const weekExpenses = await db.collection('expenses')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfWeek))
            .get();

        let weekTotal = 0;
        weekExpenses.forEach(doc => {
            weekTotal += doc.data().amount || 0;
        });

        // Recurring expenses
        const recurringExpenses = await db.collection('expenses')
            .where('frequency', 'in', ['hebdomadaire', 'mensuel'])
            .get();

        let recurringTotal = 0;
        recurringExpenses.forEach(doc => {
            recurringTotal += doc.data().amount || 0;
        });

        document.getElementById('monthExpenses').textContent = formatCurrency(monthTotal);
        document.getElementById('weekExpenses').textContent = formatCurrency(weekTotal);
        document.getElementById('recurringExpenses').textContent = formatCurrency(recurringTotal);

    } catch (error) {
        console.error('Erreur:', error);
    }
}

async function loadExpensesList() {
    const filterType = document.getElementById('filterType').value;
    const filterMonth = document.getElementById('filterMonth').value;

    try {
        let query = db.collection('expenses');

        // Apply type filter
        if (filterType !== 'all') {
            query = query.where('type', '==', filterType);
        }

        // Apply month filter
        if (filterMonth) {
            const [year, month] = filterMonth.split('-');
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59);

            query = query
                .where('date', '>=', firebase.firestore.Timestamp.fromDate(startOfMonth))
                .where('date', '<=', firebase.firestore.Timestamp.fromDate(endOfMonth));
        }

        const snapshot = await query.orderBy('date', 'desc').get();

        displayExpenses(snapshot.docs);

    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement des dépenses');
    }
}

function displayExpenses(docs) {
    const tbody = document.getElementById('expensesTableBody');

    if (docs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-message">Aucune dépense enregistrée</td></tr>';
        return;
    }

    tbody.innerHTML = docs.map(doc => {
        const data = doc.data();
        const typeLabels = {
            'loyer': 'Loyer',
            'salaire': 'Salaire',
            'electricite': 'Électricité',
            'wifi': 'WiFi',
            'maintenance': 'Maintenance',
            'autre': 'Autre'
        };

        const frequencyLabels = {
            'unique': 'Unique',
            'hebdomadaire': 'Hebdomadaire',
            'mensuel': 'Mensuel'
        };

        return `
            <tr>
                <td>${formatDate(data.date.toDate())}</td>
                <td>${typeLabels[data.type] || data.type}</td>
                <td>${data.description || '-'}</td>
                <td>${frequencyLabels[data.frequency] || data.frequency}</td>
                <td>${formatCurrency(data.amount)}</td>
                <td>
                    <button class="btn-danger" onclick="deleteExpense('${doc.id}')" style="padding: 0.5rem; font-size: 0.875rem;">
                        Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteExpense(expenseId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
        return;
    }

    try {
        await db.collection('expenses').doc(expenseId).delete();
        alert('Dépense supprimée avec succès');
        loadExpensesSummary();
        loadExpensesList();
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression');
    }
}

async function syncToSheets(type, data) {
    try {
        const settingsDoc = await db.collection('settings').doc('sheets').get();

        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            if (settings.autoSync && settings.sheetsUrl) {
                console.log('Auto-sync enabled - data ready to sync:', type, data);
            }
        }
    } catch (error) {
        console.log('Sheets sync not configured');
    }
}

function formatCurrency(amount) {
    return `${Math.round(amount).toLocaleString('fr-FR')} F`;
}

function formatDate(date) {
    return date.toLocaleDateString('fr-FR');
}
