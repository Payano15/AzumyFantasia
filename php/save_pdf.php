<?php
// Ruta del directorio donde se guardarán los PDFs
$uploadDir = __DIR__ . '/../pdfs/';

// Verifica si el directorio existe, si no, lo crea
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'No se pudo crear el directorio para guardar los archivos.'
        ]);
        exit;
    }
}

// Verifica si se recibió un archivo
if (isset($_FILES['pdf']) && $_FILES['pdf']['error'] === UPLOAD_ERR_OK) {
    $tmpName = $_FILES['pdf']['tmp_name'];
    $fileName = basename($_FILES['pdf']['name']); // Asegúrate de sanear el nombre del archivo
    $filePath = $uploadDir . $fileName;

    // Mueve el archivo al directorio de destino
    if (move_uploaded_file($tmpName, $filePath)) {
        echo json_encode([
            'status' => 'success',
            'path' => 'pdfs/' . $fileName
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Error al mover el archivo.'
        ]);
    }
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'No se recibió el archivo o hubo un error en la carga.'
    ]);
}
?>