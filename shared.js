// Dark Mode Management
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Set initial dark mode state
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('darkMode', isDark);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDarkMode();
}); 