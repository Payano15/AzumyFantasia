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

// Obtener parámetros de consulta
$id = $_GET['id'] ?? null;
$idsubartic = $_GET['idsubartic'] ?? null;

// Preparar la consulta SQL
$sql = "
    SELECT 
        articulo, 
        descripcion, 
        IFNULL(precio, 0.00) AS precio, 
        urlimagen, 
        ind_principal, 
        grupo_principal 
    FROM 
        articulos a
    JOIN 
        sub_articulo sb ON sb.idsubartic = a.idarticulo
    WHERE sb.id = ?
         AND a.idarticulo = ?
";

$stmt = $conn->prepare($sql);

if ($stmt === false) {
    die("Error en la preparación de la consulta: " . $conn->error);
}

// Enlazar parámetros
$stmt->bind_param('ii', $id, $idsubartic);

// Ejecutar la consulta
$stmt->execute();

// Obtener resultados
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Enviar resultados como JSON
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(['message' => 'No se encontraron resultados']);
}

// Cerrar declaración y conexión
$stmt->close();
$conn->close();
?>
