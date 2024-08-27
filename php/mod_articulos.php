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
    echo json_encode(['success' => false, 'message' => 'La conexión falló: ' . $conn->connect_error]);
    exit();
}

// Verificar si se ha enviado el formulario
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $productId = intval($_POST['product-id']);
    $productDescription = $_POST['product-description'];
    $productPrice = floatval($_POST['product-price']);
    $showOnHomepage = isset($_POST['show-on-homepage']) ? 'S' : 'N';
    $inicioOptions = $_POST['inicioOptions'] ?? null;

    // Manejar la imagen (opcional)
    $productImage = null;
    if (isset($_FILES['product-image']) && $_FILES['product-image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        $uploadFile = $uploadDir . basename($_FILES['product-image']['name']);
        if (move_uploaded_file($_FILES['product-image']['tmp_name'], $uploadFile)) {
            $productImage = basename($_FILES['product-image']['name']);
        } else {
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'message' => 'Error al subir la imagen']);
            exit();
        }
    }

    // Crear la consulta de actualización
    $sql = "UPDATE sub_articulo SET 
                descripcion = ?, 
                precio = ?, 
                estatus = 'ACT', 
                fechacreate = NOW(), 
                ind_principal = ?, 
                grupo_principal = ?";

    // Agregar la actualización de la imagen solo si se subió una nueva
    if ($productImage) {
        $sql .= ", urlimagen = ?";
    }

    $sql .= " WHERE id = ?";

    // Preparar la declaración
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Error en la preparación de la declaración UPDATE: ' . $conn->error]);
        exit();
    }

    // Vincular los parámetros
    if ($productImage) {
        $stmt->bind_param('sdssss', $productDescription, $productPrice, $showOnHomepage, $inicioOptions, $productImage, $productId);
    } else {
        $stmt->bind_param('sdsss', $productDescription, $productPrice, $showOnHomepage, $inicioOptions, $productId);
    }

    // Ejecutar la consulta
    if ($stmt->execute()) {
        $response = [
            'success' => true,
            'message' => 'Producto actualizado exitosamente',
            'affectedRows' => $stmt->affected_rows // Filas afectadas por la actualización
        ];
    } else {
        $response = [
            'success' => false,
            'message' => 'Error al actualizar el producto: ' . $stmt->error
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($response);

    $stmt->close();
}

// Cerrar la conexión
$conn->close();
