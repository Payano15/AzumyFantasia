// Verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        // Redirigir al inicio de sesión si no está autenticado
        window.location.href = 'login.html';
    }
});

// Manejar el cierre de sesión
document.getElementById('logout-button').addEventListener('click', function() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'login.html';
});
