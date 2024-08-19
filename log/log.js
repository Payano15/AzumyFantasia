document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Previene el envío del formulario

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Credenciales de ejemplo (deberías usar una base de datos real en un entorno de producción)
    const validUsername = 'admin';
    const validPassword = 'admin123';

    if (username === validUsername && password === validPassword) {
        // Guardar el estado de sesión
        localStorage.setItem('loggedIn', 'true');
        window.location.href = 'admin.html'; // Redirigir al administrador
    } else {
        alert('Nombre de usuario o contraseña incorrectos.');
    }
});