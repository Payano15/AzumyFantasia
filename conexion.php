<?php
require_once __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;

// Cargar el archivo .env
$dotenv = Dotenv::createImmutable(__DIR__);
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
    $productName = trim($_POST['product-name']);
    $productDescription = $_POST['product-description'];
    $productPrice = $_POST['product-price'];
    $showOnHomepage = isset($_POST['show-on-homepage']) ? 'S' : 'N';
    $inicioOptions = $_POST['inicioOptions'] ?? null;

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

    // Generar el código del artículo (primeras 4 letras del nombre del producto)
    $codArticulo = substr($productName, 0, 4);

    // Comprobar si el producto ya existe
    $sql = "SELECT idarticulo, codarticulo FROM articulos WHERE LOWER(articulo) = LOWER(?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración del SELECT: ' . $conn->error]);
        exit();
    }
    $stmt->bind_param('s', $productName);
    $stmt->execute();
    $result = $stmt->get_result();

    $selectResult = [];
    if ($result->num_rows > 0) {
        // Producto ya existe, capturar idarticulo y codarticulo
        $selectResult = $result->fetch_assoc();
        $idArticulo = $selectResult['idarticulo'];
        $codArticulo = $selectResult['codarticulo'];
    } else {
        // Producto no existe, insertar nuevo producto
        $sql = "INSERT INTO articulos (articulo, estatus, fechacreate, codarticulo) VALUES (?, 'ACT', NOW(), ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración INSERT: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param('ss', $productName, $codArticulo);
        if (!$stmt->execute()) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error al guardar el producto: ' . $stmt->error]);
            exit();
        }
        $idArticulo = $stmt->insert_id; // Obtener el idarticulo recién insertado

        // Realizar un nuevo SELECT para obtener el idarticulo y codarticulo del producto recién insertado
        $sql = "SELECT idarticulo, codarticulo FROM articulos WHERE idarticulo = ?";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración del SELECT después de la inserción: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param('i', $idArticulo);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $selectResult = $result->fetch_assoc();
            $idArticulo = $selectResult['idarticulo'];
            $codArticulo = $selectResult['codarticulo'];
        } else {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'No se pudo encontrar el producto después de la inserción']);
            exit();
        }
    }

    // Asignar valores a idsubartic y codsubartic
    $idsubartic = $idArticulo;
    $codsubartic = $codArticulo;

    // Insertar en la tabla sub_articulo
    $sql = "INSERT INTO sub_articulo (idsubartic, descripcion, estatus, fechacreate, urlimagen, codarticulo, ind_principal, grupo_principal, precio)
            VALUES (?, ?, 'ACT', NOW(), ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración INSERT en sub_articulo: ' . $conn->error]);
        exit();
    }

    // Ajustar los valores para mostrar
    $urlimagen = $productImage;
    $indPrincipal = $showOnHomepage;
    $grupoPrincipal = $inicioOptions;

    // Preparar la consulta con los valores
    $query = sprintf(
        "INSERT INTO sub_articulo (idsubartic, descripcion, estatus, fechacreate, urlimagen, codarticulo, ind_principal, grupo_principal, precio)
         VALUES (%d, '%s', 'ACT', NOW(), '%s', '%s', '%s', '%s', %.2f)",
        $idsubartic,
        $productDescription,
        $urlimagen,
        $codsubartic,
        $indPrincipal,
        $grupoPrincipal,
        $productPrice
    );

    // Ejecutar la consulta real
    $stmt->bind_param(
        'isssssd', // 'i' para entero, 's' para cadena, 'd' para decimal
        $idsubartic,
        $productDescription,
        $urlimagen,
        $codsubartic,
        $indPrincipal,
        $grupoPrincipal,
        $productPrice
    );

    if ($stmt->execute()) {
        $response = [
            'status' => 'success',
            'message' => 'Producto guardado exitosamente',
            'selectResult' => $selectResult, // Agregar resultado del select
            'insertArticulos' => $idArticulo, // Agregar idarticulo insertado
            'insertSubArticulo' => $stmt->affected_rows // Filas afectadas por la inserción
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
