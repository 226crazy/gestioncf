// Sessions Management Logic

let gameCounter = 1;
let selectedGames = [];

document.addEventListener('DOMContentLoaded', () => {
    setupSessionForm();
    setDefaultTimes();
});

function setDefaultTimes() {
    const now = new Date();
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');

    // Format: YYYY-MM-DDTHH:MM
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    startTime.value = formatDateTime(now);

    // Add 30 minutes for default end time
    const endDate = new Date(now.getTime() + 30 * 60000);
    endTime.value = formatDateTime(endDate);
}

function setupSessionForm() {
    // Setup console select change handlers
    setupConsoleSelect(0);

    // Add game button
    document.getElementById('addGameBtn').addEventListener('click', addGameEntry);

    // Form submission
    document.getElementById('sessionForm').addEventListener('submit', handleSessionSubmit);
}

function setupConsoleSelect(index) {
    const consoleSelect = document.getElementById(`console_${index}`);
    const gameTypeSelect = document.getElementById(`gameType_${index}`);
    const priceInfo = document.getElementById(`priceInfo_${index}`);

    consoleSelect.addEventListener('change', () => {
        const console = consoleSelect.value;
        gameTypeSelect.innerHTML = '<option value="">Sélectionner...</option>';

        if (console && PRICING[console]) {
            PRICING[console].forEach((option, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = option.label;
                gameTypeSelect.appendChild(opt);
            });
        }
    });

    gameTypeSelect.addEventListener('change', () => {
        const console = consoleSelect.value;
        const gameTypeIndex = gameTypeSelect.value;

        if (console && gameTypeIndex !== '' && PRICING[console]) {
            const selected = PRICING[console][gameTypeIndex];
            priceInfo.textContent = `Prix: ${selected.price} F`;
            updateSelectedGames(index, console, gameTypeIndex, selected.price);
            calculateTotal();
        }
    });
}

function updateSelectedGames(index, console, gameTypeIndex, price) {
    selectedGames[index] = {
        console: console,
        gameType: PRICING[console][gameTypeIndex].label,
        price: price
    };
}

function addGameEntry() {
    const container = document.getElementById('gamesContainer');
    const newIndex = gameCounter++;

    const gameEntry = document.createElement('div');
    gameEntry.className = 'game-entry';
    gameEntry.innerHTML = `
        <h3>Jeu ${gameCounter}</h3>
        <div class="form-row">
            <div class="form-group">
                <label for="console_${newIndex}">Console</label>
                <select id="console_${newIndex}" class="console-select" required>
                    <option value="">Sélectionner...</option>
                    <option value="PS4-01">PS4 01</option>
                    <option value="PS4-02">PS4 02</option>
                    <option value="PS5-01">PS5 01</option>
                    <option value="PS5-02">PS5 02</option>
                    <option value="Nintendo-Switch">Nintendo Switch</option>
                    <option value="Simulateur">Simulateur de Course</option>
                    <option value="VR">Réalité Virtuelle</option>
                </select>
            </div>
            <div class="form-group">
                <label for="gameType_${newIndex}">Type de Jeu</label>
                <select id="gameType_${newIndex}" class="game-type-select" required>
                    <option value="">Sélectionner console d'abord...</option>
                </select>
            </div>
        </div>
        <div class="price-info" id="priceInfo_${newIndex}"></div>
        <button type="button" class="btn-danger" onclick="removeGame(this, ${newIndex})">Supprimer ce jeu</button>
    `;

    container.appendChild(gameEntry);
    setupConsoleSelect(newIndex);
}

function removeGame(button, index) {
    button.closest('.game-entry').remove();
    delete selectedGames[index];
    calculateTotal();
}

function calculateTotal() {
    const total = selectedGames.reduce((sum, game) => {
        return sum + (game ? game.price : 0);
    }, 0);

    document.getElementById('totalAmount').textContent = `${total.toLocaleString('fr-FR')} F`;
}

async function handleSessionSubmit(e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const startTime = new Date(document.getElementById('startTime').value);
    const endTime = new Date(document.getElementById('endTime').value);
    const paymentMethod = document.getElementById('paymentMethod').value;
    const isPaid = document.getElementById('isPaid').checked;

    // Filter out empty game entries
    const games = selectedGames.filter(g => g !== undefined);

    if (games.length === 0) {
        alert('Veuillez sélectionner au moins un jeu');
        return;
    }

    const totalAmount = games.reduce((sum, game) => sum + game.price, 0);

    const sessionData = {
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        startTime: firebase.firestore.Timestamp.fromDate(startTime),
        endTime: firebase.firestore.Timestamp.fromDate(endTime),
        games: games,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        isPaid: isPaid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser.uid
    };

    try {
        await db.collection('sessions').add(sessionData);

        // Sync to Google Sheets if enabled
        await syncToSheets('sessions', sessionData);

        alert('Session enregistrée avec succès!');

        // Reset form
        document.getElementById('sessionForm').reset();
        selectedGames = [];
        gameCounter = 1;

        // Reset to single game entry
        document.getElementById('gamesContainer').innerHTML = `
            <div class="game-entry">
                <h3>Jeu 1</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="console_0">Console</label>
                        <select id="console_0" class="console-select" required>
                            <option value="">Sélectionner...</option>
                            <option value="PS4-01">PS4 01</option>
                            <option value="PS4-02">PS4 02</option>
                            <option value="PS5-01">PS5 01</option>
                            <option value="PS5-02">PS5 02</option>
                            <option value="Nintendo-Switch">Nintendo Switch</option>
                            <option value="Simulateur">Simulateur de Course</option>
                            <option value="VR">Réalité Virtuelle</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="gameType_0">Type de Jeu</label>
                        <select id="gameType_0" class="game-type-select" required>
                            <option value="">Sélectionner console d'abord...</option>
                        </select>
                    </div>
                </div>
                <div class="price-info" id="priceInfo_0"></div>
            </div>
        `;

        setupConsoleSelect(0);
        setDefaultTimes();
        calculateTotal();

        // Redirect to dashboard
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
        alert('Erreur lors de l\'enregistrement de la session');
    }
}

// Sync to Google Sheets helper function
async function syncToSheets(type, data) {
    try {
        const settingsDoc = await db.collection('settings').doc('sheets').get();

        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            if (settings.autoSync && settings.sheetsUrl) {
                // Note: Actual Google Sheets integration would require backend API
                console.log('Auto-sync enabled - data ready to sync:', type, data);
            }
        }
    } catch (error) {
        console.log('Sheets sync not configured');
    }
}
