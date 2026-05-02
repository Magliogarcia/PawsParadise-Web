<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { ob_end_clean(); exit(0); }
require_once '../conexion.php';
$response = ['success' => false, 'error' => 'Error desconocido'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nombre = limpiarDato($_POST['nombre'] ?? '');
    $apellido = limpiarDato($_POST['apellido'] ?? '');
    $cedula = limpiarDato($_POST['cedula'] ?? '');
    $email = limpiarDato($_POST['email'] ?? '');
    $telefono = limpiarDato($_POST['telefono'] ?? '');
    $password = $_POST['password'] ?? '';
    $tipo = limpiarDato($_POST['tipo'] ?? 'cliente');

    if (empty($nombre) || empty($apellido) || empty($cedula) || empty($email) || empty($password)) {
        $response['error'] = 'Todos los campos obligatorios deben estar llenos';
    } else {
        try {
            $check = $conn->prepare("SELECT id FROM usuarios WHERE email = ? OR cedula = ?");
            $check->execute([$email, $cedula]);
            
            if ($check->fetch()) {
                $response['error'] = 'El correo o la cédula ya están registrados';
            } else {
                $pass_hash = password_hash($password, PASSWORD_DEFAULT);
                $query = $conn->prepare("INSERT INTO usuarios (nombre, apellido, cedula, email, telefono, password, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)");
                if ($query->execute([$nombre, $apellido, $cedula, $email, $telefono, $pass_hash, $tipo])) {
                    $response['success'] = true;
                    unset($response['error']);
                }
            }
        } catch (PDOException $e) { $response['error'] = 'Error en la base de datos: ' . $e->getMessage(); }
    }
}
ob_end_clean();
echo json_encode($response);
?>