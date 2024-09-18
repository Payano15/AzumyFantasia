<?php
require_once '../vendor/autoload.php'; // Asegúrate de incluir la librería de Twilio

use Twilio\Rest\Client;

// Carga las credenciales de Twilio
$sid = 'ACd6a4fbd859304969bca82212b26dca12'; // Tu Account SID
$auth_token = '9c415b014f319954ec5f3b53b4fcb6cc'; // Tu Auth Token
$client = new Client($sid, $auth_token);

header('Content-Type: application/json'); // Asegúrate de que el contenido devuelto es JSON

// Obtener y guardar los datos de la solicitud para depuración
$data = json_decode(file_get_contents('php://input'), true);
file_put_contents('debug.log', print_r($data, true)); // Guarda los datos en un archivo para revisión

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => 'error', 'message' => 'Error en la decodificación JSON']);
    exit;
}

$pdfPath = $data['pdfPath'] ?? '';

// Validar si pdfPath está presente
if ($pdfPath) {
    try {
        $message = $client->messages->create(
            'whatsapp:+18292792398', // Número de destino
            [
                'from' => 'whatsapp:+14155238886', // Tu número de Twilio
                'body' => 'Tu factura está lista. Puedes descargarla aquí: ' . $pdfPath
            ]
        );
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'El archivo PDF no está disponible.']);
}
?>

