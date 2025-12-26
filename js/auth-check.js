// Check if user is authenticated

auth.onAuthStateChanged((user) => {
    if (!user) {
        // User not logged in, redirect to login
        window.location.href = 'index.html';
    }
});

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erreur de déconnexion:', error);
        alert('Erreur lors de la déconnexion');
    }
});

// Mobile menu toggle
document.getElementById('hamburger')?.addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
});
