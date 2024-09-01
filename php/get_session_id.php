<?php
// Generar un nuevo identificador entero único
$new_session_id = (int) mt_rand(100000, 999999); // Genera un número entero aleatorio y lo convierte a entero

// Devolver el nuevo session_id como JSON
header('Content-Type: application/json');
echo json_encode(['session_id' => $new_session_id]);
?>