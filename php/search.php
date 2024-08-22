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

// Obtener la consulta de búsqueda
$query = $_GET['q'] ?? '';

// Consultas SQL
$sql = "SELECT idarticulo, articulo, codarticulo FROM articulos WHERE articulo LIKE ? LIMIT 10";
$stmt = $conn->prepare($sql);
$searchTerm = "%$query%";
$stmt->bind_param('s', $searchTerm);

// Ejecutar la declaración
$stmt->execute();

// Obtener resultados
$result = $stmt->get_result();
$articles = array();
while ($row = $result->fetch_assoc()) {
    $articles[] = $row;
}

// Devolver resultados como JSON
header('Content-Type: application/json');
echo json_encode($articles);

// Cerrar la declaración y la conexión
$stmt->close();
$conn->close();
?>