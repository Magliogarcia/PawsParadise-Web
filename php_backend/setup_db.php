<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'conexion.php';

try {
    // Limpiamos todo para empezar de cero con la estructura nueva
    $conn->exec("DROP TABLE IF EXISTS pedido_detalles");
    $conn->exec("DROP TABLE IF EXISTS pedidos");
    $conn->exec("DROP TABLE IF EXISTS usuarios");
    $conn->exec("DROP TABLE IF EXISTS productos");

    // 1. Tabla Usuarios
    $conn->exec("CREATE TABLE usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        apellido TEXT NOT NULL,
        cedula TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        telefono TEXT,
        password TEXT NOT NULL,
        tipo TEXT DEFAULT 'cliente',
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // 2. Tabla Productos (con columna imagen)
    $conn->exec("CREATE TABLE productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio REAL NOT NULL,
        stock INTEGER NOT NULL,
        imagen TEXT,
        categoria TEXT,
        activo INTEGER DEFAULT 1
    )");

    // 3. Tablas de Pedidos
    $conn->exec("CREATE TABLE pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        total REAL NOT NULL,
        metodo_pago TEXT NOT NULL,
        estado TEXT DEFAULT 'pendiente',
        fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )");

    $conn->exec("CREATE TABLE pedido_detalles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER,
        producto_id INTEGER,
        cantidad INTEGER NOT NULL,
        precio_unitario REAL NOT NULL,
        FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
        FOREIGN KEY(producto_id) REFERENCES productos(id)
    )");

    // --- INSERCIÓN DE DATOS PREDETERMINADOS ---

    // Usuario Administrador
    $password_hash = password_hash('Francis28$', PASSWORD_DEFAULT);
    $stmtUser = $conn->prepare("INSERT INTO usuarios (nombre, apellido, cedula, email, telefono, password, tipo) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmtUser->execute(['Admin', 'Principal', 'V-00000000', 'admin@gmail.com', '0000000000', $password_hash, 'admin']);

    // Productos clásicos de Paws Paradise
    $productos = [
        ['Alimento para perros adultos', 'Nutrición completa para perros de razas grandes.', 45.00, 20, 'Alimento'],
        ['Alimento para cachorros', 'Fórmula especial para un crecimiento fuerte y sano.', 50.00, 15, 'Alimento'],
        ['Alimento para gatos', 'Rico en taurina para la salud del corazón y visión.', 40.00, 25, 'Alimento'],
        ['Alimento Premium', 'Calidad superior con ingredientes 100% naturales.', 60.00, 10, 'Alimento'],
        ['Collar Ajustable Reflectivo', 'Seguridad para paseos nocturnos. Talla M.', 15.99, 45, 'Accesorios'],
        ['Correa Retráctil 5m', 'Mecanismo de freno. Hasta 25kg.', 24.99, 32, 'Accesorios'],
        ['Juguete de Cuerda Nudos', 'Resistente para juegos de tira y afloja.', 9.99, 67, 'Accesorios'],
        ['Comedero Elevado Ajustable', 'Mejora la postura al comer. Incluye 2 bowls.', 34.99, 14, 'Accesorios']
    ];

    $stmtProd = $conn->prepare("INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)");
    foreach ($productos as $p) {
        $stmtProd->execute($p);
    }

    echo "✅ Base de datos regenerada con éxito. Usuarios y Productos predeterminados listos.";

} catch(PDOException $e) {
    echo "❌ Error creando tablas: " . $e->getMessage();
}
?>