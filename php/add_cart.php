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
    die("La conexión falló: " . $conn->connect_error);
}

// Crear tabla temporal si no existe
$createTableSQL = "
    CREATE TABLE IF NOT EXISTS temp_cart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        quantity INT NOT NULL,
        image_url VARCHAR(255) NOT NULL,
        invoice_number INT NOT NULL,
        session_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
";

if ($conn->query($createTableSQL) === FALSE) {
    die("Error al crear la tabla: " . $conn->error);
}

// Obtener datos del cuerpo de la solicitud (POST)
$data = json_decode(file_get_contents('php://input'), true);

// Verificar datos recibidos
error_log(print_r($data, true)); // Registrar datos recibidos para depuración

$product_id = $data['product_id'] ?? null;
$name = $data['name'] ?? null;
$description = $data['description'] ?? null;
$price = $data['price'] ?? null;
$quantity = $data['quantity'] ?? null;
$image_url = $data['image_url'] ?? null;
$invoice_number = $data['invoice_number'] ?? null; // Verifica si está llegando correctamente
$session_id = $data['session_id'] ?? null; // Recibir el session_id desde la solicitud POST

// Validar datos
if (is_null($product_id) || is_null($name) || is_null($description) || is_null($price) || is_null($quantity) || is_null($image_url) || is_null($invoice_number) || is_null($session_id)) {
    echo json_encode(['message' => 'Datos incompletos']);
    $conn->close();
    exit;
}

// Preparar la consulta SQL para insertar en temp_cart
$sql = "
    INSERT INTO temp_cart (product_id, name, description, price, quantity, image_url, invoice_number, session_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    die("Error en la preparación de la consulta: " . $conn->error);
}

// Enlazar parámetros
$stmt->bind_param('sssdissi', $product_id, $name, $description, $price, $quantity, $image_url, $invoice_number, $session_id);

// Ejecutar la consulta
if ($stmt->execute()) {
    echo json_encode(['message' => 'Producto añadido al carrito temporal']);
} else {
    echo json_encode(['message' => 'Error al añadir producto al carrito temporal']);
}

// Cerrar declaración y conexión
$stmt->close();
$conn->close();
?>
