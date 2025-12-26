// Authentication Logic

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginBox = document.querySelector('.login-box:not(#registerBox)');
    const registerBox = document.getElementById('registerBox');

    // Toggle between login and register
    showRegisterLink?.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    });

    showLoginLink?.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.style.display = 'none';
        loginBox.style.display = 'block';
    });

    // Login Form Submit
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            errorMessage.style.display = 'none';
            const userCredential = await auth.signInWithEmailAndPassword(email, password);

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.textContent = getErrorMessage(error.code);
            errorMessage.style.display = 'block';
        }
    });

    // Register Form Submit
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const role = document.getElementById('regRole').value;
        const errorMessage = document.getElementById('regErrorMessage');

        try {
            errorMessage.style.display = 'none';
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);

            // Update user profile
            await userCredential.user.updateProfile({
                displayName: name
            });

            // Create user document in Firestore
            await db.collection('managers').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                role: role,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } catch (error) {
            errorMessage.textContent = getErrorMessage(error.code);
            errorMessage.style.display = 'block';
        }
    });
});

// Error message translation
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'Cette adresse email est déjà utilisée.',
        'auth/invalid-email': 'Adresse email invalide.',
        'auth/operation-not-allowed': 'Opération non autorisée.',
        'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
        'auth/user-disabled': 'Ce compte a été désactivé.',
        'auth/user-not-found': 'Aucun compte trouvé avec cette adresse email.',
        'auth/wrong-password': 'Mot de passe incorrect.',
        'auth/too-many-requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'auth/network-request-failed': 'Erreur de connexion. Vérifiez votre connexion internet.'
    };

    return errorMessages[errorCode] || 'Une erreur est survenue. Veuillez réessayer.';
}
