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
        $uploadDir = '../uploads/';
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
    $sql = "SELECT idarticulo, codarticulo FROM articulos WHERE articulo = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración: ' . $conn->error]);
        exit();
    }
    $stmt->bind_param('s', $productName);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Producto ya existe, capturar idarticulo y codarticulo
        $row = $result->fetch_assoc();
        $idArticulo = $row['idarticulo'];
        $codArticulo = $row['codarticulo'];
    } else {
        // Producto no existe, insertar nuevo producto
        $sql = "INSERT INTO articulos (articulo, estatus, fechacreate, codarticulo) VALUES (?, 'ACT', NOW(), ?)";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración: ' . $conn->error]);
            exit();
        }
        $stmt->bind_param('ss', $productName, $codArticulo);
        if (!$stmt->execute()) {
            header('Content-Type: application/json');
            echo json_encode(['status' => 'error', 'message' => 'Error al guardar el producto: ' . $stmt->error]);
            exit();
        }
        $idArticulo = $stmt->insert_id; // Obtener el idarticulo recién insertado
    }
    $stmt->close();

    // Insertar o actualizar en la tabla sub_articulo
    $sql = "INSERT INTO sub_articulo (idsubartic, descripcion, estatus, fechacreate, comentario, urlimagen, codarticulo, ind_principal, grupo_principal, precio)
            VALUES (?, ?, 'ACT', NOW(), '', ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                descripcion = VALUES(descripcion),
                comentario = VALUES(comentario),
                urlimagen = VALUES(urlimagen),
                ind_principal = VALUES(ind_principal),
                grupo_principal = VALUES(grupo_principal),
                precio = VALUES(precio)";
    
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error en la preparación de la declaración: ' . $conn->error]);
        exit();
    }
    
    $stmt->bind_param(
        'sssssss',
        $idArticulo,
        $productDescription,
        $productImage,
        $codArticulo,
        $showOnHomepage,
        $inicioOptions,
        $productPrice
    );
    
    if ($stmt->execute()) {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'success', 'message' => 'Producto guardado exitosamente']);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['status' => 'error', 'message' => 'Error al guardar el producto: ' . $stmt->error]);
    }

    $stmt->close();
}

// Cerrar la conexión
$conn->close();
?>
