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
    header('Content-Type: application/json');
    echo json_encode(['status' => 'error', 'message' => 'La conexión falló: ' . $conn->connect_error]);
    exit();
}

// Verificar si se ha enviado la solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los parámetros desde el cuerpo de la solicitud
    $input = json_decode(file_get_contents('php://input'), true);
    error_log(print_r($input, true)); // Registra los datos recibidos

    $productId = $input['id'] ?? null;
    // $idSubartic = $input['idsubartic'] ?? null;

    // // Verificar que ambos parámetros no estén vacíos y sean numéricos
    // if (empty($productId) || !is_numeric($productId) || empty($idSubartic) || !is_numeric($idSubartic)) {
    //     header('Content-Type: application/json');
    //     echo json_encode(['status' => 'error', 'message' => 'ID del producto o ID Subartículo no válidos']);
    //     exit();
    // }

    // Preparar la consulta UPDATE
    $sql = "UPDATE sub_articulo SET estatus = 'ANU' WHERE id = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la consulta UPDATE: ' . $conn->error]);
        exit();
    }

    // Vincular los parámetros como enteros
    $stmt->bind_param('i', $productId);

    // Ejecutar la consulta
    if ($stmt->execute()) {
        // Verificar si se actualizó alguna fila
        if ($stmt->affected_rows > 0) {
            $response = [
                'success' => true,
                'message' => 'Producto anulado correctamente.'
            ];
        } else {
            $response = [
                'success' => false,
                'message' => 'No se encontró el producto o el artículo con los IDs proporcionados.'
            ];
        }
    } else {
        $response = [
            'success' => false,
            'message' => 'Error al anular el producto: ' . $stmt->error
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($response);

    $stmt->close();
}

// Cerrar la conexión
$conn->close();