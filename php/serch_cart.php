<?php
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

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(['error' => 'La conexión falló: ' . $conn->connect_error]);
    $conn->close();
    exit;
}

// Obtener el session_id de la solicitud GET
$session_id = $_GET['session_id'] ?? null;

if (is_null($session_id)) {
    echo json_encode(['error' => 'session_id no proporcionado']);
    $conn->close();
    exit;
}

// Preparar la consulta SQL para obtener productos del carrito
$sql = "SELECT * FROM temp_cart WHERE session_id = ?";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    echo json_encode(['error' => 'Error en la preparación de la consulta: ' . $conn->error]);
    $conn->close();
    exit;
}

// Enlazar parámetro
$stmt->bind_param('i', $session_id);

// Ejecutar la consulta
$stmt->execute();

$result = $stmt->get_result();

$cartItems = [];

while ($row = $result->fetch_assoc()) {
    $cartItems[] = $row;
}

echo json_encode($cartItems);

// Cerrar declaración y conexión
$stmt->close();
$conn->close();
?>
