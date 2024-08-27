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

// Verificar si se ha enviado el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $productId = $_POST['product-id'] ?? null;
    $productDescription = $_POST['product-description'] ?? '';
    $productPrice = $_POST['product-price'] ?? '';
    $showOnHomepage = isset($_POST['show-on-homepage']) ? 'S' : 'N';
    $grupo = $_POST['grupo'] ?? 'default'; // Se asume que 'default' es el valor por defecto
    $type = $_POST['type'] ?? ''; // Asegúrate de que 'type' sea el tipo de operación (MOD o algo más)

    // Manejar la imagen
    $productImage = null;
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        $uploadFile = $uploadDir . basename($_FILES['product-image']['name']);
        if (move_uploaded_file($_FILES['product-image']['tmp_name'], $uploadFile)) {
            $productImage = basename($_FILES['product-image']['name']);
        } else {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error al subir la imagen']);
            exit();
        }
    }

    // Asegurarse de que el ID del producto no sea nulo
    if (empty($productId) || !is_numeric($productId)) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'ID del producto no válido']);
        exit();
    }

    // Preparar la llamada al procedimiento almacenado
    $sql = "CALL usp_manage_productos(?, ?, ?, ?, ?, ?, ?, @o_message)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración del procedimiento almacenado: ' . $conn->error]);
        exit();
    }

    // Bind los parámetros
    $stmt->bind_param(
        'isssssi',
        $productId,             // ID del producto
        $productDescription,    // Descripción del producto
        $productPrice,          // Precio del producto
        $productImage,          // Imagen del producto (URL de la imagen)
        $showOnHomepage,        // Mostrar en la página principal (S o N)
        $grupo,                 // Grupo
        $type                   // Tipo de operación (MOD o algo más)
    );

    // Ejecutar el procedimiento
    if ($stmt->execute()) {
        // Obtener el mensaje del procedimiento almacenado
        $result = $conn->query("SELECT @o_message AS message");
        $row = $result->fetch_assoc();
        $message = $row['message'];

        $response = [
            'status' => 'success',
            'message' => $message,
            'productId' => $productId, // ID del producto insertado o modificado
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Error al guardar el producto: ' . $stmt->error
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($response);

    $stmt->close();
}

// Cerrar la conexión
$conn->close();
?>
