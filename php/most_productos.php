<?php
require_once __DIR__ . '/../vendor/autoload.php';

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
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'La conexión falló: ' . $conn->connect_error]);
    exit();
}

// Verificar si se han enviado parámetros mediante POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario o de la solicitud
    $textosearch = $_POST['textosearch'] ?? '';

    // Preparar llamada al procedimiento almacenado
    $stmt = $conn->prepare("CALL usp_mostrar_productos(?)");
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación del procedimiento almacenado: ' . $conn->error]);
        exit();
    }

    // Vincular el parámetro
    $stmt->bind_param('s', $textosearch);
    $stmt->execute();

    // Obtener los resultados
    $result = $stmt->get_result();
    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }

    // Cerrar el statement
    $stmt->close();

    // Preparar la respuesta
    $response = [
        'status' => 'success',
        'data' => $results
    ];

    header('Content-Type: application/json');
    echo json_encode($response);
} else {
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'Método de solicitud no permitido']);
}

// Cerrar la conexión
$conn->close();
?>
