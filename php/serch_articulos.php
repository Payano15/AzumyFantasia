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

// Obtener parámetros
$textosearch = isset($_GET['textosearch']) ? $_GET['textosearch'] : '';
$estatus = isset($_GET['estatus']) ? $_GET['estatus'] : 'ACT';
$pageIndex = isset($_GET['pageIndex']) ? (int)$_GET['pageIndex'] : 1;
$pageSize = isset($_GET['pageSize']) ? (int)$_GET['pageSize'] : 10;

// Preparar y ejecutar el procedimiento almacenado
$sql = "CALL usp_serch_articulos(?, ?, ?, ?, @totalrows, @firstrow, @lastrow)";
if (!$stmt = $conn->prepare($sql)) {
    die("Error al preparar la consulta: " . $conn->error);
}

// Enlazar parámetros
$stmt->bind_param("ssii", $textosearch, $estatus, $pageIndex, $pageSize);

// Ejecutar el procedimiento almacenado
if (!$stmt->execute()) {
    die("Error al ejecutar el procedimiento almacenado: " . $stmt->error);
}

// Obtener los resultados del procedimiento almacenado
$results = array();
if ($result = $stmt->get_result()) {
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
} else {
    die("Error al obtener los resultados del procedimiento almacenado: " . $stmt->error);
}

// Liberar el resultado del procedimiento almacenado
$stmt->free_result();
$stmt->close();

// Ejecutar la consulta para obtener los parámetros de salida
$paramQuery = "SELECT @totalrows AS totalrows, @firstrow AS firstrow, @lastrow AS lastrow";
if ($result2 = $conn->query($paramQuery)) {
    $row = $result2->fetch_assoc();
    $totalrows = $row['totalrows'] ?? 0;
    $firstrow = $row['firstrow'] ?? 0;
    $lastrow = $row['lastrow'] ?? 0;
    $result2->free(); // Liberar el resultado de los parámetros de salida
} else {
    die("Error al ejecutar la consulta para los parámetros de salida: " . $conn->error);
}

// Devolver la respuesta en JSON
header('Content-Type: application/json');
echo json_encode(array(
    'results' => $results,
    'totalrows' => $totalrows,
    'firstrow' => $firstrow,
    'lastrow' => $lastrow
));

// Cerrar la conexión
$conn->close();
?>
