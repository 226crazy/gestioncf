// Check if user is authenticated and handle role-based access

let currentUserRole = null;

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        // User not logged in, redirect to login
        window.location.href = 'index.html';
        return;
    }

    // Get user role from Firestore
    try {
        const userDoc = await db.collection('managers').doc(user.uid).get();
        if (userDoc.exists) {
            currentUserRole = userDoc.data().role;

            // Check if gérant is trying to access restricted pages
            const currentPage = window.location.pathname.split('/').pop();
            const restrictedPages = ['expenses.html', 'settings.html'];

            if (currentUserRole === 'gerant' && restrictedPages.includes(currentPage)) {
                alert('Accès refusé. Vous n\'avez pas les permissions nécessaires.');
                window.location.href = 'dashboard.html';
                return;
            }

            // Hide navigation items based on role
            updateNavigationByRole(currentUserRole);
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du rôle:', error);
    }
});

// Update navigation based on user role
function updateNavigationByRole(role) {
    if (role === 'gerant') {
        // Hide admin-only menu items
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === 'expenses.html' || href === 'settings.html') {
                link.style.display = 'none';
            }
        });

        // Also hide dashboard elements for gérant
        hideDashboardAdminElements();
    }
}

// Hide admin-only elements on dashboard for gérants
function hideDashboardAdminElements() {
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'dashboard.html') {
        // Hide certain dashboard elements
        const meterBtn = document.getElementById('addMeterBtn');
        const expenseBtn = document.querySelector('a[href="expenses.html"]');

        if (meterBtn) meterBtn.style.display = 'none';
        if (expenseBtn) expenseBtn.style.display = 'none';
    }

    if (currentPage === 'reports.html') {
        // Gérants can only see revenue, not expenses
        const expensesCard = document.getElementById('totalExpenses');
        const profitCard = document.getElementById('netProfit');

        if (expensesCard && expensesCard.parentElement) {
            expensesCard.parentElement.style.display = 'none';
        }
        if (profitCard && profitCard.parentElement) {
            profitCard.parentElement.style.display = 'none';
        }
    }
}

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

// Export for use in other files
window.getUserRole = function() {
    return currentUserRole;
};
