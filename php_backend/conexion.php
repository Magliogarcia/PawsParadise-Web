<?php
// Configuración de encabezados para permitir que tu página (Frontend) se comunique con este servidor (Backend)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Responder rápido a las peticiones de verificación del navegador (Preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ==========================================
// TUS DATOS REALES DE INFINITYFREE
// ==========================================
$host = "sql208.infinityfree.com";
$dbname = "if0_41752957_tienda";
$username = "if0_41752957";
$password = "Maglio28"; 

try {
    // Conexión profesional usando PDO para MySQL
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    
    // Configuración de errores y modo de obtención de datos
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
} catch(PDOException $e) {
    // Si hay un error de conexión, lo devuelve como un mensaje JSON claro
    die(json_encode([
        "success" => false, 
        "error" => "No se pudo conectar a la base de datos de InfinityFree: " . $e.getMessage()
    ]));
}
?>