<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Cargar el archivo .env
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Determinar el entorno
$environment = getenv('APP_ENV') ?: 'local'; // 'local' o 'production'

// Configuración de la base de datos según el entorno
if ($environment === 'production') {
    $servername = $_ENV['DB_HOST_PRODUCTION'];
    $username = $_ENV['DB_USERNAME_PRODUCTION'];
    $password = $_ENV['DB_PASSWORD_PRODUCTION'];
    $dbname = $_ENV['DB_DATABASE_PRODUCTION'];
} else {
    $servername = $_ENV['DB_HOST_LOCAL'];
    $username = $_ENV['DB_USERNAME_LOCAL'];
    $password = $_ENV['DB_PASSWORD_LOCAL'];
    $dbname = $_ENV['DB_DATABASE_LOCAL'];
}

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("La conexión falló: " . $conn->connect_error);
}

// Verificar si se ha enviado el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el nombre del producto del formulario
    $productName = $_POST['product-name'];

    // Validar y limpiar el input
    $productName = trim($productName);
    
    // Generar el código del artículo (primeras 4 letras del nombre del producto)
    $codArticulo = substr($productName, 0, 4);
    
    // Crear la consulta SQL
    $sql = "INSERT INTO articulos (articulo, estatus, fechacreate, codarticulo) VALUES (?, 'ACT', NOW(), ?)";
    
    // Preparar la declaración
    $stmt = $conn->prepare($sql);
    
    // Verificar si la preparación fue exitosa
    if ($stmt === false) {
        die("Error en la preparación de la declaración: " . $conn->error);
    }
    
    // Enlazar los parámetros
    $stmt->bind_param('ss', $productName, $codArticulo);
    
    // Ejecutar la declaración
    if ($stmt->execute()) {
        echo "Producto guardado exitosamente";
    } else {
        echo "Error al guardar el producto: " . $stmt->error;
    }
    
    // Cerrar la declaración
    $stmt->close();
}

// Cerrar la conexión
$conn->close();
?>