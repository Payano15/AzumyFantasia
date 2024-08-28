<?php
// Habilitar la visualización de errores
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Cargar las variables de entorno si estás usando .env
require_once '../vendor/autoload.php';
use Dotenv\Dotenv;

// Cargar el archivo .env
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
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

// Crear conexión a la base de datos
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("La conexión falló: " . $conn->connect_error);
}

// Preparar y ejecutar el procedimiento almacenado
$sql = "CALL usp_get_productos_agrupados();";
if (!$result = $conn->query($sql)) {
    die("Error al ejecutar el procedimiento almacenado: " . $conn->error);
}

// Agrupar los productos
$productos = array(
    'nuevos' => array(),
    'destacados' => array(),
    'queridos' => array()
);

while ($row = $result->fetch_assoc()) {
    // Agrupa según el valor de 'grupo_principal'
    switch ($row['grupo_principal']) {
        case 1:
            $productos['nuevos'][] = $row;
            break;
        case 2:
            $productos['destacados'][] = $row;
            break;
        case 3:
            $productos['queridos'][] = $row;
            break;
    }
}

// Liberar el resultado del procedimiento almacenado
$result->free();

// Devolver la respuesta en JSON
header('Content-Type: application/json');
echo json_encode($productos);

// Cerrar la conexión
$conn->close();
?>
