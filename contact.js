document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const darkModeToggle = document.getElementById('darkModeToggle');
    const contactForm = document.getElementById('contactForm');

    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Form Submission
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // In a real application, this would be sent to a backend server
        console.log('Form submission:', formData);

        // Show success message
        alert('Thank you for your message! We will get back to you soon.');
        
        // Reset form
        contactForm.reset();
    });

    // Form Validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('invalid', (e) => {
            e.preventDefault();
            input.classList.add('error');
        });

        input.addEventListener('input', () => {
            if (input.classList.contains('error')) {
                input.classList.remove('error');
            }
        });
    });

    // Mock Map Interaction
    const mockMap = document.querySelector('.mock-map');
    if (mockMap) {
        mockMap.addEventListener('click', () => {
            // In a real application, this would open a real map
            window.open('https://maps.google.com', '_blank');
        });
    }
}); 