// ==========================================
// 1. SISTEMA DE NOTIFICACIONES Y VENTANAS (MODALES)
// ==========================================

// NUEVO: Sistema de Notificaciones Flotantes (Toasts) - ¡Adiós alert() nativo!
window.mostrarNotificacionLocal = function(mensaje, tipo = 'success') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = tipo === 'success' ? '#27ae60' : '#e74c3c';
    toast.style.color = 'white';
    toast.style.padding = '15px 25px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    toast.style.zIndex = '999999';
    toast.style.fontSize = '1.05rem';
    toast.style.fontWeight = 'bold';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transform = 'translateY(100px)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';

    const icon = tipo === 'success' ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-exclamation-circle"></i>';
    toast.innerHTML = `${icon} <span>${mensaje}</span>`;

    document.body.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);

    // Desaparecer después de 3 segundos
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
};

// Creador de ventanas de confirmación profesionales - ¡Adiós confirm() nativo!
window.mostrarConfirmacion = function(mensaje, callback) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0'; overlay.style.left = '0';
    overlay.style.width = '100%'; overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '999999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';

    const isDelete = mensaje.toLowerCase().includes('eliminar') || mensaje.toLowerCase().includes('vaciar');
    const colorTheme = isDelete ? '#e74c3c' : '#3498db';
    const iconTheme = isDelete ? 'fa-exclamation-triangle' : 'fa-question-circle';

    const box = document.createElement('div');
    box.style.backgroundColor = 'white';
    box.style.padding = '35px';
    box.style.borderRadius = '15px';
    box.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
    box.style.textAlign = 'center';
    box.style.maxWidth = '450px';
    box.style.width = '90%';
    box.style.transform = 'translateY(-30px)';
    box.style.transition = 'transform 0.3s ease';

    box.innerHTML = `
        <div style="font-size: 3.5rem; color: ${colorTheme}; margin-bottom: 15px;"><i class="fas ${iconTheme}"></i></div>
        <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 1.5rem;">Confirmar</h3>
        <p style="color: #7f8c8d; margin-bottom: 25px; font-size: 1.1rem; line-height: 1.5;">${mensaje}</p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="btn-cancel-custom" style="padding: 12px 25px; border: none; border-radius: 8px; background: #f1f2f6; color: #2c3e50; font-size: 1rem; font-weight: bold; cursor: pointer; transition: 0.2s;">Cancelar</button>
            <button id="btn-ok-custom" style="padding: 12px 25px; border: none; border-radius: 8px; background: ${colorTheme}; color: white; font-size: 1rem; font-weight: bold; cursor: pointer; transition: 0.2s;">Aceptar</button>
        </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.style.opacity = '1'; box.style.transform = 'translateY(0)'; }, 10);

    const close = (result) => {
        overlay.style.opacity = '0'; box.style.transform = 'translateY(-30px)';
        setTimeout(() => { document.body.removeChild(overlay); callback(result); }, 300);
    };

    document.getElementById('btn-cancel-custom').onclick = () => close(false);
    document.getElementById('btn-ok-custom').onclick = () => close(true);
};

// ==========================================
// 2. SESIÓN Y AUTENTICACIÓN
// ==========================================
async function getSesionActual() {
    const sesionGuardada = localStorage.getItem('sesionActual');
    return sesionGuardada ? JSON.parse(sesionGuardada) : null;
}

async function cerrarSesion() {
    localStorage.removeItem('sesionActual');
    await fetch('admin/cerrar_sesion.php').catch(() => {});
    window.location.href = 'index.html';
}

async function registrarUsuario(nombre, apellido, cedula, email, telefono, password, tipo) {
    try {
        const response = await fetch('admin/registro.php', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ nombre, apellido, cedula, email, telefono, password, tipo })
        });
        const text = await response.text();
        try { return JSON.parse(text); } catch (e) { return { success: false, error: 'Error del servidor' }; }
    } catch (error) { return { success: false, error: 'Error de red' }; }
}

async function iniciarSesion(email, password) {
    try {
        const response = await fetch('admin/login_ajax.php', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        });
        const data = await response.json();
        if (data.success) localStorage.setItem('sesionActual', JSON.stringify(data.usuario));
        return data;
    } catch (error) { return { success: false, error: 'Error de conexión' }; }
}

async function actualizarMenuUsuario() {
    const sesion = await getSesionActual();
    const nav = document.querySelector('.nav ul');
    if (!nav) return;
    
    const path = window.location.pathname;
    const actInicio = path.endsWith('/') || path.includes('index.html') ? 'class="active"' : '';
    const actProd = path.includes('productos.html') ? 'class="active"' : '';
    const actServ = path.includes('servicios.html') ? 'class="active"' : '';
    const actMisPed = path.includes('mis_pedidos.html') ? 'class="active"' : '';
    
    if (sesion && sesion.tipo === 'admin') {
        nav.innerHTML = `
            <li><a href="productos.html" ${actProd}>Ver Tienda</a></li>
            <li><a href="panel_admin.html" style="color: #e67e22; font-weight: bold;"><i class="fas fa-boxes"></i> Panel de Control</a></li>
            <li style="color: var(--primary); font-weight: bold; padding: 0 15px;"><i class="fas fa-user-shield"></i> ${sesion.nombre}</li>
            <li><a href="#" onclick="cerrarSesion(); return false;" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
        `;
    } else if (sesion && sesion.tipo === 'cliente') {
        nav.innerHTML = `
            <li><a href="index.html" ${actInicio}>Inicio</a></li>
            <li><a href="productos.html" ${actProd}>Productos</a></li>
            <li><a href="servicios.html" ${actServ}>Servicios</a></li>
            <li><a href="mis_pedidos.html" ${actMisPed} style="color: #2980b9; font-weight: bold;"><i class="fas fa-box-open"></i> Mis Pedidos</a></li>
            <li style="color: var(--primary); font-weight: bold; padding: 0 15px;"><i class="fas fa-user"></i> ${sesion.nombre}</li>
            <li><a href="#" onclick="cerrarSesion(); return false;" style="color: var(--danger);"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
            <li><a href="carrito.html" class="cart-link"><i class="fas fa-shopping-cart"></i><span class="cart-count">0</span></a></li>
        `;
    } else {
        nav.innerHTML = `
            <li><a href="index.html" ${actInicio}>Inicio</a></li>
            <li><a href="productos.html" ${actProd}>Productos</a></li>
            <li><a href="servicios.html" ${actServ}>Servicios</a></li>
            <li><a href="login.html" class="btn-login-nav"><i class="fas fa-sign-in-alt"></i> Iniciar sesión</a></li>
            <li><a href="registro.html" class="btn-register-nav"><i class="fas fa-user-plus"></i> Registrarse</a></li>
            <li><a href="carrito.html" class="cart-link"><i class="fas fa-shopping-cart"></i><span class="cart-count">0</span></a></li>
        `;
    }
    actualizarContadorCarrito();
}

// ==========================================
// 3. TIENDA Y CARRITO
// ==========================================
function getCarrito() { return JSON.parse(localStorage.getItem('cart')) || []; }
function guardarCarrito(carrito) { localStorage.setItem('cart', JSON.stringify(carrito)); actualizarContadorCarrito(); }

window.agregarAlCarrito = function(id, producto, precio, stock) {
    const carrito = getCarrito();
    const existing = carrito.find(i => i.id === id);
    if (existing) {
        if (existing.quantity < stock) existing.quantity += 1;
        else { mostrarNotificacionLocal('No hay más stock disponible', 'error'); return; }
    } else { carrito.push({ id: id, name: producto, price: precio, quantity: 1, stock: stock }); }
    guardarCarrito(carrito);
    mostrarNotificacionLocal('¡Producto agregado al carrito!', 'success');
};

function actualizarContadorCarrito() {
    const total = getCarrito().reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(c => c.textContent = total);
}

// RENDERIZAR PRODUCTOS DESTACADOS EN EL INICIO
async function cargarProductosDestacados() {
    const contenedor = document.getElementById('productos-destacados-inicio');
    if (!contenedor) return;

    try {
        const response = await fetch('admin/productos_api.php?accion=listar');
        const data = await response.json();
        
        if (data.success && data.productos.length > 0) {
            const destacados = data.productos.slice(0, 4);
            let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 30px;">';
            
            destacados.forEach(prod => {
                const imgSrc = prod.imagen ? `/static/${prod.imagen}` : 'https://via.placeholder.com/300?text=Sin+Imagen';
                const btnCart = prod.stock > 0 ? `<button class="btn-add-cart btn-auth" style="width:100%; padding:12px; border-radius:8px;" onclick="agregarAlCarrito(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', ${prod.precio}, ${prod.stock})"><i class="fas fa-shopping-cart"></i> Agregar</button>` : `<button disabled style="width:100%; padding:12px; background:#bdc3c7; color:white; border:none; border-radius:8px; cursor:not-allowed;">Agotado</button>`;
                
                html += `
                    <div class="product-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; transition: 0.3s; height: 100%;">
                        <img src="${imgSrc}" alt="${prod.nombre}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                        <div class="product-info" style="display: flex; flex-direction: column; flex-grow: 1;">
                            <h3 style="margin: 0 0 10px 0; color: var(--text-dark); font-size: 1.2rem;">${prod.nombre}</h3>
                            <div class="product-price-row" style="margin-top: auto; padding-top:15px;">
                                <div style="margin-bottom: 15px; text-align: left;">
                                    <span style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">$${parseFloat(prod.precio).toFixed(2)}</span>
                                </div>
                                ${btnCart}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            contenedor.innerHTML = html;
        } else {
            contenedor.innerHTML = '<p style="text-align:center; color:#7f8c8d;">No hay productos destacados.</p>';
        }
    } catch (error) { contenedor.innerHTML = '<p style="text-align:center; color:red;">Error cargando la tienda.</p>'; }
}

async function cargarProductosTienda() {
    const contenedor = document.getElementById('contenedor-productos-dinamicos');
    if (!contenedor) return;

    try {
        const response = await fetch('admin/productos_api.php?accion=listar');
        const data = await response.json();
        
        if (data.success && data.productos.length > 0) {
            let html = '';
            const categorias = ['Alimento', 'Accesorios', 'Salud'];
            
            categorias.forEach(cat => {
                const prodsCat = data.productos.filter(p => p.categoria === cat);
                if (prodsCat.length > 0) {
                    html += `<h2 style="text-align: center; color: var(--primary); margin: 50px 0 30px; font-size: 2.2rem;">${cat}</h2>`;
                    html += `<div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 30px;">`;
                    
                    prodsCat.forEach(prod => {
                        const imgSrc = prod.imagen ? `/static/${prod.imagen}` : 'https://via.placeholder.com/300?text=Sin+Imagen';
                        const stockBadge = prod.stock > 0 ? `<span style="background:#e8f8f5; color:#27ae60; padding:5px 12px; border-radius:20px; font-size:0.85rem; font-weight:bold; float:right;">Stock: ${prod.stock}</span>` : `<span style="background:#fee2e2; color:#e74c3c; padding:5px 12px; border-radius:20px; font-size:0.85rem; font-weight:bold; float:right;">Agotado</span>`;
                        const btnCart = prod.stock > 0 ? `<button class="btn-add-cart btn-auth" style="width:100%; padding:12px; border-radius:8px;" onclick="agregarAlCarrito(${prod.id}, '${prod.nombre.replace(/'/g, "\\'")}', ${prod.precio}, ${prod.stock})"><i class="fas fa-shopping-cart"></i> Agregar al carrito</button>` : `<button disabled style="width:100%; padding:12px; background:#bdc3c7; color:white; border:none; border-radius:8px; cursor:not-allowed;">Agotado</button>`;
                        
                        html += `
                            <div class="product-card" style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); display: flex; flex-direction: column; transition: 0.3s; height: 100%;">
                                <img src="${imgSrc}" alt="${prod.nombre}" style="width: 100%; height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
                                <div class="product-info" style="display: flex; flex-direction: column; flex-grow: 1;">
                                    <h3 style="margin: 0 0 10px 0; color: var(--text-dark); font-size: 1.3rem;">${prod.nombre}</h3>
                                    <p style="color: #7f8c8d; font-size: 0.95rem; margin-bottom: 20px; line-height: 1.5;">${prod.descripcion || 'Sin descripción'}</p>
                                    <div class="product-price-row" style="margin-top: auto; padding-top:15px;">
                                        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 1.6rem; font-weight: 800; color: var(--primary);">$${parseFloat(prod.precio).toFixed(2)}</span>
                                            ${stockBadge}
                                        </div>
                                        ${btnCart}
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                    html += `</div>`;
                }
            });
            contenedor.innerHTML = html;
        } else {
            contenedor.innerHTML = '<div style="text-align:center; padding: 50px;"><h3 style="color:#7f8c8d;">No hay productos disponibles.</h3></div>';
        }
    } catch (error) { contenedor.innerHTML = '<p style="text-align:center; color:red;">Error cargando la tienda.</p>'; }
}

function mostrarCarrito() {
    const carrito = getCarrito();
    const container = document.getElementById('cart-items-container');
    const summary = document.getElementById('cart-summary');
    const totalItemsSpan = document.getElementById('cart-total-items');
    const btnClearCart = document.getElementById('clear-cart');
    if (!container) return;
    
    if (carrito.length === 0) {
        container.innerHTML = `<div class="cart-empty" style="text-align: center; padding: 40px 0;"><i class="fas fa-shopping-cart" style="font-size: 4rem; color: #ccc; margin-bottom: 15px;"></i><p style="color: #666; margin-bottom: 20px;">Tu carrito está vacío</p><a href="productos.html" style="background: var(--primary); color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Ver productos</a></div>`;
        if (summary) summary.style.display = 'none';
        if (btnClearCart) btnClearCart.style.display = 'none';
        if (totalItemsSpan) totalItemsSpan.textContent = '0';
    } else {
        let html = ''; let subtotal = 0;
        carrito.forEach((item, index) => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;
            html += `<div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                <div class="cart-item-info"><h4 style="margin-bottom: 5px; color: var(--dark);">${item.name}</h4><p style="color: #7f8c8d; font-size: 0.9rem;">$${item.price.toFixed(2)} c/u</p></div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button style="background: #eee; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" onclick="cambiarCantidad(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button style="background: #eee; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;" onclick="cambiarCantidad(${index}, 1)">+</button>
                </div>
                <div style="font-weight: bold; font-size: 1.1rem; color: var(--primary);">$${itemSubtotal.toFixed(2)}</div>
                <button style="background: #fee2e2; color: var(--danger); border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer;" onclick="eliminarDelCarrito(${index})"><i class="fas fa-times"></i></button>
            </div>`;
        });
        container.innerHTML = html;
        if (summary) summary.style.display = 'block';
        if (btnClearCart) btnClearCart.style.display = 'block';
        if (totalItemsSpan) totalItemsSpan.textContent = carrito.reduce((sum, item) => sum + item.quantity, 0);
        if (document.getElementById('subtotal')) document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        if (document.getElementById('shipping')) document.getElementById('shipping').textContent = `$5.00`;
        if (document.getElementById('total')) document.getElementById('total').textContent = `$${(subtotal + 5).toFixed(2)}`;
    }
}

window.cambiarCantidad = function(index, cambio) {
    const carrito = getCarrito();
    if (carrito[index]) {
        carrito[index].quantity += cambio;
        if (carrito[index].quantity <= 0) carrito.splice(index, 1);
        guardarCarrito(carrito); mostrarCarrito();
    }
};
window.eliminarDelCarrito = function(index) {
    const carrito = getCarrito(); carrito.splice(index, 1);
    guardarCarrito(carrito); mostrarCarrito();
};

async function cargarMisPedidos() {
    const contenedor = document.getElementById('contenedor-mis-pedidos');
    if (!contenedor) return;

    const sesion = await getSesionActual();
    if (!sesion) { window.location.href = 'login.html'; return; }

    try {
        const response = await fetch(`admin/pedidos_api.php?accion=listar_cliente&usuario_id=${sesion.id}`);
        const data = await response.json();

        if (data.success) {
            if (data.pedidos.length === 0) {
                contenedor.innerHTML = '<div style="text-align:center; padding: 50px;"><i class="fas fa-box-open fa-3x" style="color:#ccc; margin-bottom:15px;"></i><h3 style="color:#7f8c8d;">Aún no has realizado ningún pedido.</h3><br><a href="productos.html" class="btn-auth" style="padding:10px 20px;">Ir a la tienda</a></div>';
                return;
            }

            let html = '';
            data.pedidos.forEach(ped => {
                let estadoClass = ped.estado === 'Pendiente' ? 'color: #e67e22;' : (ped.estado === 'En envío' ? 'color: #3498db;' : 'color: #27ae60;');
                let colorBorde = ped.estado === 'Pendiente' ? '#e67e22' : (ped.estado === 'En envío' ? '#3498db' : '#27ae60');
                let iconClass = ped.estado === 'Pendiente' ? 'fa-clock' : (ped.estado === 'En envío' ? 'fa-truck' : 'fa-check-circle');

                let detallesHtml = '';
                if (ped.detalles && ped.detalles.length > 0) {
                    ped.detalles.forEach(det => {
                        const imgSrc = det.imagen ? `/static/${det.imagen}` : 'https://via.placeholder.com/50?text=Foto';
                        detallesHtml += `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #eee;">
                                <div style="display:flex; align-items:center; gap:15px;">
                                    <img src="${imgSrc}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; border: 1px solid #eee;">
                                    <div>
                                        <strong style="color:var(--text-dark);">${det.nombre}</strong><br>
                                        <small style="color:#7f8c8d;">Cant: ${det.cantidad} x $${parseFloat(det.precio_unitario).toFixed(2)}</small>
                                    </div>
                                </div>
                                <strong style="color:var(--primary); font-size:1.1rem;">$${(det.cantidad * det.precio_unitario).toFixed(2)}</strong>
                            </div>
                        `;
                    });
                }

                html += `
                    <div style="background:white; border-radius:12px; padding:25px; margin-bottom:30px; box-shadow:0 8px 25px rgba(0,0,0,0.05); border-left: 6px solid ${colorBorde}">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #eee; padding-bottom:15px; margin-bottom:15px;">
                            <div>
                                <h3 style="margin:0 0 5px 0; color:var(--text-dark);">Pedido #PED-${ped.id}</h3>
                                <small style="color:#7f8c8d;"><i class="fas fa-calendar-alt"></i> ${ped.fecha_pedido}</small>
                            </div>
                            <div style="text-align:right;">
                                <span style="${estadoClass} font-weight:bold; font-size:1.1rem; display:block; margin-bottom:5px;"><i class="fas ${iconClass}"></i> ${ped.estado}</span>
                                <h3 style="margin:0; color:var(--primary);">Total: $${parseFloat(ped.total).toFixed(2)}</h3>
                            </div>
                        </div>
                        <div>${detallesHtml}</div>
                    </div>
                `;
            });
            contenedor.innerHTML = html;
        } else { contenedor.innerHTML = `<p style="color:red; text-align:center;">Error cargando pedidos.</p>`; }
    } catch (error) { contenedor.innerHTML = '<p style="color:red; text-align:center;">Error de conexión.</p>'; }
}


// ==========================================
// 4. PANEL DE ADMINISTRADOR
// ==========================================
window.cambiarTabAdmin = function(tab) {
    document.getElementById('tab-btn-inventario').classList.remove('active');
    document.getElementById('tab-btn-pedidos').classList.remove('active');
    document.getElementById('seccion-inventario').style.display = 'none';
    document.getElementById('seccion-pedidos').style.display = 'none';

    document.getElementById(`tab-btn-${tab}`).classList.add('active');
    document.getElementById(`seccion-${tab}`).style.display = 'block';

    if (tab === 'pedidos') cargarPedidosAdmin();
};

window.abrirModalProducto = function(producto = null) {
    const modalProducto = document.getElementById('modal-producto');
    if (!modalProducto) return;
    
    document.getElementById('modal-titulo').innerHTML = producto ? '<i class="fas fa-edit"></i> Editar Producto' : '<i class="fas fa-box"></i> Nuevo Producto';
    document.getElementById('prod-id').value = producto ? producto.id : '';
    document.getElementById('prod-nombre').value = producto ? producto.nombre : '';
    document.getElementById('prod-categoria').value = producto ? producto.categoria : 'Alimento';
    document.getElementById('prod-precio').value = producto ? producto.precio : '';
    document.getElementById('prod-stock').value = producto ? producto.stock : '';
    document.getElementById('prod-descripcion').value = producto && producto.descripcion ? producto.descripcion : '';
    
    document.getElementById('prod-imagen').value = '';
    document.getElementById('prod-imagen-actual').value = producto && producto.imagen ? producto.imagen : '';
    document.getElementById('texto-imagen-actual').style.display = (producto && producto.imagen) ? 'block' : 'none';

    modalProducto.style.display = 'flex';
    modalProducto.style.opacity = '1';
    modalProducto.style.pointerEvents = 'auto';
    setTimeout(() => modalProducto.classList.add('show'), 10);
};

window.cerrarModalProducto = function() {
    const modalProducto = document.getElementById('modal-producto');
    if (!modalProducto) return;
    modalProducto.classList.remove('show');
    modalProducto.style.opacity = '0';
    modalProducto.style.pointerEvents = 'none';
    setTimeout(() => { modalProducto.style.display = 'none'; document.getElementById('form-producto')?.reset(); }, 300);
};

async function cargarInventarioAdmin() {
    const tbody = document.getElementById('admin-productos-lista');
    if (!tbody) return;

    try {
        const sesion = await getSesionActual();
        const response = await fetch(`admin/productos_api.php?accion=listar&rol_usuario=${sesion ? sesion.tipo : ''}`);
        const data = await response.json();
        
        if (data.success) {
            if (data.productos.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">No hay productos.</td></tr>'; return; }
            let html = '';
            data.productos.forEach(prod => {
                let stockClass = prod.stock === 0 ? 'stock-out' : (prod.stock <= 5 ? 'stock-low' : 'stock-ok');
                const imgSrc = prod.imagen ? `/static/${prod.imagen}` : 'https://via.placeholder.com/50?text=Foto';
                const prodJSON = JSON.stringify(prod).replace(/'/g, "&#39;");
                
                html += `<tr>
                    <td><img src="${imgSrc}" class="prod-img-preview" alt="img"></td>
                    <td><strong>${prod.nombre}</strong></td>
                    <td><span style="color: #7f8c8d;"><i class="fas fa-tag"></i> ${prod.categoria || 'N/A'}</span></td>
                    <td style="font-weight: bold; color: var(--primary);">$${parseFloat(prod.precio).toFixed(2)}</td>
                    <td><span class="stock-badge ${stockClass}">${prod.stock}</span></td>
                    <td style="text-align: right;">
                        <button class="action-btn btn-edit" onclick='abrirModalProducto(${prodJSON})' title="Editar"><i class="fas fa-edit"></i></button>
                        <button class="action-btn btn-delete" onclick="eliminarProductoAdmin(${prod.id}, '${prod.nombre}')" title="Eliminar"><i class="fas fa-trash-alt"></i></button>
                    </td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }
    } catch (error) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error de conexión.</td></tr>'; }
}

window.eliminarProductoAdmin = function(id, nombre) {
    mostrarConfirmacion(`¿Seguro que deseas eliminar "${nombre}" del inventario?`, async (confirmado) => { 
        if (confirmado) ejecutarEliminacion(id); 
    });
};

async function ejecutarEliminacion(id) {
    try {
        const sesion = await getSesionActual();
        const response = await fetch('admin/productos_api.php?accion=eliminar', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `id=${id}&rol_usuario=${sesion ? sesion.tipo : ''}`
        });
        const data = await response.json();
        if (data.success) { mostrarNotificacionLocal(data.message, 'success'); cargarInventarioAdmin(); } 
    } catch (error) { mostrarNotificacionLocal('Error de red', 'error'); }
}

async function cargarPedidosAdmin() {
    const tbody = document.getElementById('admin-pedidos-lista');
    if (!tbody) return;

    try {
        const sesion = await getSesionActual();
        const response = await fetch(`admin/pedidos_api.php?accion=listar_admin&rol_usuario=${sesion ? sesion.tipo : ''}`);
        const data = await response.json();

        if (data.success) {
            if (data.pedidos.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;">No hay pedidos registrados.</td></tr>'; return; }
            let html = '';
            data.pedidos.forEach(ped => {
                let selClass = ped.estado === 'Pendiente' ? 'est-pendiente' : (ped.estado === 'En envío' ? 'est-envio' : 'est-recibido');
                let selectHtml = `
                    <select class="select-estado ${selClass}" onchange="cambiarEstadoPedido(${ped.id}, this.value, this)">
                        <option value="Pendiente" ${ped.estado === 'Pendiente'?'selected':''}>Pendiente</option>
                        <option value="En envío" ${ped.estado === 'En envío'?'selected':''}>En envío</option>
                        <option value="Recibido" ${ped.estado === 'Recibido'?'selected':''}>Recibido</option>
                    </select>
                `;

                html += `<tr>
                    <td><strong>#PED-${ped.id}</strong></td>
                    <td>${ped.nombre} ${ped.apellido}<br><small style="color:#7f8c8d;">${ped.cedula}</small></td>
                    <td>${ped.fecha_pedido}</td>
                    <td style="color:var(--primary); font-weight:bold;">$${parseFloat(ped.total).toFixed(2)}</td>
                    <td><span style="background:#eee; padding:5px 8px; border-radius:5px; font-size:0.85rem;">${ped.metodo_pago === 'pagomovil' ? 'Pago Móvil' : 'Efectivo'}</span></td>
                    <td>${selectHtml}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }
    } catch (error) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">Error de conexión.</td></tr>'; }
}

window.cambiarEstadoPedido = async function(id, nuevoEstado, selectElement) {
    try {
        const sesion = await getSesionActual();
        const response = await fetch('admin/pedidos_api.php?accion=actualizar_estado', {
            method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, 
            body: `id=${id}&estado=${nuevoEstado}&rol_usuario=${sesion ? sesion.tipo : ''}`
        });
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacionLocal('Estado actualizado', 'success');
            selectElement.className = `select-estado ${nuevoEstado === 'Pendiente' ? 'est-pendiente' : (nuevoEstado === 'En envío' ? 'est-envio' : 'est-recibido')}`;
        }
    } catch (error) { mostrarNotificacionLocal('Error de conexión', 'error'); }
};

// ==========================================
// 5. INICIALIZACIÓN GLOBAL Y EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', async function() {
    await actualizarMenuUsuario();
    actualizarContadorCarrito();
    const sesionActual = await getSesionActual();
    
    // Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = document.querySelector('.btn-auth');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...'; btn.disabled = true;

            const result = await iniciarSesion(document.getElementById('email').value, document.getElementById('password').value);
            if (result.success) {
                mostrarNotificacionLocal(`¡Bienvenido ${result.usuario.nombre}!`, 'success');
                setTimeout(() => window.location.href = result.usuario.tipo === 'admin' ? 'panel_admin.html' : 'index.html', 1000);
            } else {
                btn.innerHTML = 'Entrar'; btn.disabled = false;
                mostrarNotificacionLocal(result.error, 'error');
            }
        });
    }
    
    // Registro
    const passInput = document.getElementById('password-registro');
    const registroForm = document.getElementById('registro-form');
    if (passInput) {
        const reqLength = document.getElementById('req-length');
        const reqUpper = document.getElementById('req-upper');
        const reqLower = document.getElementById('req-lower');
        const reqNumber = document.getElementById('req-number');
        const reqSpecial = document.getElementById('req-special');
        const strengthBar = document.getElementById('strength-bar');
        const strengthText = document.getElementById('strength-text');
        const btnRegistrar = document.getElementById('btn-registrar');

        passInput.addEventListener('input', function() {
            const val = this.value; let score = 0;
            if (val.length >= 8) { reqLength.className = 'req-met'; reqLength.innerHTML = '<i class="fas fa-check-circle"></i> Mínimo 8 caracteres'; score++; } else { reqLength.className = 'req-unmet'; reqLength.innerHTML = '<i class="fas fa-times-circle"></i> Mínimo 8 caracteres'; }
            if (/[A-Z]/.test(val)) { reqUpper.className = 'req-met'; reqUpper.innerHTML = '<i class="fas fa-check-circle"></i> Al menos una mayúscula'; score++; } else { reqUpper.className = 'req-unmet'; reqUpper.innerHTML = '<i class="fas fa-times-circle"></i> Al menos una mayúscula'; }
            if (/[a-z]/.test(val)) { reqLower.className = 'req-met'; reqLower.innerHTML = '<i class="fas fa-check-circle"></i> Al menos una minúscula'; score++; } else { reqLower.className = 'req-unmet'; reqLower.innerHTML = '<i class="fas fa-times-circle"></i> Al menos una minúscula'; }
            if (/[0-9]/.test(val)) { reqNumber.className = 'req-met'; reqNumber.innerHTML = '<i class="fas fa-check-circle"></i> Al menos un número'; score++; } else { reqNumber.className = 'req-unmet'; reqNumber.innerHTML = '<i class="fas fa-times-circle"></i> Al menos un número'; }
            if (/[\@\$\!\%\*\?\&]/.test(val)) { reqSpecial.className = 'req-met'; reqSpecial.innerHTML = '<i class="fas fa-check-circle"></i> Al menos un carácter especial (@$!%*?&)'; score++; } else { reqSpecial.className = 'req-unmet'; reqSpecial.innerHTML = '<i class="fas fa-times-circle"></i> Al menos un carácter especial (@$!%*?&)'; }

            strengthBar.className = 'strength-bar'; strengthText.className = 'strength-text';
            if (val.length === 0) { strengthText.textContent = 'Seguridad: Ninguna'; strengthText.style.color = '#7f8c8d'; btnRegistrar.disabled = true; btnRegistrar.style.opacity = '0.5'; btnRegistrar.style.cursor = 'not-allowed'; } 
            else if (score <= 2) { strengthBar.classList.add('bar-weak'); strengthText.textContent = 'Seguridad: Débil'; strengthText.classList.add('text-weak'); btnRegistrar.disabled = true; btnRegistrar.style.opacity = '0.5'; btnRegistrar.style.cursor = 'not-allowed'; } 
            else if (score >= 3 && score <= 4) { strengthBar.classList.add('bar-medium'); strengthText.textContent = 'Seguridad: Media'; strengthText.classList.add('text-medium'); btnRegistrar.disabled = true; btnRegistrar.style.opacity = '0.5'; btnRegistrar.style.cursor = 'not-allowed'; } 
            else if (score === 5) { strengthBar.classList.add('bar-strong'); strengthText.textContent = 'Seguridad: Fuerte'; strengthText.classList.add('text-strong'); btnRegistrar.disabled = false; btnRegistrar.style.opacity = '1'; btnRegistrar.style.cursor = 'pointer'; }
        });
    }

    if (registroForm) {
        registroForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const pass = document.getElementById('password-registro').value;
            if (pass !== document.getElementById('confirm-password').value) { mostrarNotificacionLocal('Las contraseñas no coinciden', 'error'); return; }
            
            const btnSubmit = this.querySelector('button[type="submit"]');
            const txtOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...'; btnSubmit.disabled = true;

            const result = await registrarUsuario(document.getElementById('nombre-registro').value, document.getElementById('apellido-registro').value, document.getElementById('cedula-registro').value, document.getElementById('email-registro').value, document.getElementById('telefono-registro').value, pass, 'cliente');
            
            if (result.success) { mostrarNotificacionLocal('¡Registro exitoso!', 'success'); setTimeout(() => window.location.href = 'login.html', 2000); } 
            else { mostrarNotificacionLocal(result.error, 'error'); btnSubmit.innerHTML = txtOriginal; btnSubmit.disabled = false; }
        });
    }

    // Bloqueo estético del carrito para Admin
    if (sesionActual && sesionActual.tipo === 'admin') {
        window.agregarAlCarrito = function() { mostrarNotificacionLocal('Los administradores no compran, ¡venden!', 'error'); };
    }

    // Checkout Form 
    if (window.location.pathname.includes('formulario.html')) {
        if (!sesionActual) { window.location.href = 'login.html'; return; }
        ['nombre', 'apellido', 'email', 'telefono'].forEach(id => { if (document.getElementById(`checkout-${id}`)) document.getElementById(`checkout-${id}`).value = sesionActual[id] || ''; });
        if (document.getElementById('checkout-cedula')) { document.getElementById('checkout-cedula').value = sesionActual.cedula || ''; document.getElementById('checkout-cedula').readOnly = true; document.getElementById('checkout-cedula').style.background = '#eee'; }

        const tasaBCV = 483.87;
        document.querySelectorAll('input[name="metodo-pago"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.getElementById('panel-pagomovil').style.display = e.target.value === 'pagomovil' ? 'block' : 'none';
                if(e.target.value === 'pagomovil') document.getElementById('referencia-pago').setAttribute('required', 'true');
                else document.getElementById('referencia-pago').removeAttribute('required');
            });
        });

        const carrito = getCarrito();
        const subtotal = carrito.reduce((s, i) => s + (i.price * i.quantity), 0);
        const totalUSD = subtotal + 5.00;
        const totalBS = totalUSD * tasaBCV;
        
        if (document.getElementById('monto-bolivares')) document.getElementById('monto-bolivares').textContent = totalBS.toLocaleString('es-VE', { minimumFractionDigits: 2 }) + ' Bs';

        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const metodo = document.querySelector('input[name="metodo-pago"]:checked').value;
                const ref = document.getElementById('referencia-pago') ? document.getElementById('referencia-pago').value.trim() : '';
                if (metodo === 'pagomovil' && !ref) { mostrarNotificacionLocal('Ingrese referencia', 'error'); return; }

                const btnSubmit = this.querySelector('button[type="submit"]');
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...'; btnSubmit.disabled = true;

                try {
                    const formData = new URLSearchParams();
                    formData.append('usuario_id', sesionActual.id);
                    formData.append('total', totalUSD);
                    formData.append('metodo_pago', metodo);
                    formData.append('productos', JSON.stringify(carrito));

                    const response = await fetch('admin/pedidos_api.php?accion=crear', {
                        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData
                    });
                    const result = await response.json();
                    
                    if (result.success) {
                        const orden = {
                            numero: 'PED-' + result.pedido_id, fecha: new Date().toLocaleString('es-VE'),
                            cliente: { nombre: `${sesionActual.nombre} ${sesionActual.apellido}`, cedula: document.getElementById('checkout-cedula').value, email: sesionActual.email, telefono: sesionActual.telefono, direccion: document.getElementById('checkout-direccion').value, ciudad: document.getElementById('checkout-ciudad').value },
                            productos: carrito, totales: { subtotal: subtotal, envio: 5.00, totalUSD: totalUSD, totalBS: totalBS }, pago: { metodo: metodo, referencia: metodo === 'pagomovil' ? ref : 'Contra entrega', tasa: tasaBCV }
                        };
                        localStorage.setItem('ultimoPedido', JSON.stringify(orden));
                        localStorage.removeItem('cart');
                        mostrarNotificacionLocal('¡Pedido procesado!', 'success');
                        setTimeout(() => window.location.href = 'factura.html', 1000);
                    }
                } catch(error) { mostrarNotificacionLocal('Error enviando el pedido', 'error'); btnSubmit.innerHTML = 'Confirmar y Generar Pedido'; btnSubmit.disabled = false; }
            });
        }
    }

    const btnCheckout = document.querySelector('.btn-checkout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // REEMPLAZO DEL CONFIRM() NATIVO
            if (!sesionActual) { 
                mostrarConfirmacion('Inicia sesión para pagar. ¿Ir a login?', (ir) => {
                    if (ir) window.location.href = 'login.html';
                });
            } else if (sesionActual.tipo !== 'cliente') {
                mostrarNotificacionLocal('Solo clientes pueden comprar', 'error');
            } else {
                window.location.href = 'formulario.html';
            }
        });
    }

    // Factura
    if (window.location.pathname.includes('factura.html')) {
        const orden = JSON.parse(localStorage.getItem('ultimoPedido'));
        if (!orden) return window.location.href = 'index.html';
        
        ['numero', 'fecha'].forEach(id => { if(document.getElementById(`fac-${id}`)) document.getElementById(`fac-${id}`).textContent = orden[id]; });
        ['nombre', 'cedula', 'email', 'telefono', 'direccion', 'ciudad'].forEach(id => { if(document.getElementById(`fac-${id}`)) document.getElementById(`fac-${id}`).textContent = orden.cliente[id]; });
        
        let html = ''; orden.productos.forEach(p => { html += `<tr><td><strong>${p.name}</strong></td><td class="text-center">${p.quantity}</td><td class="text-right">$${p.price.toFixed(2)}</td><td class="text-right">$${(p.price * p.quantity).toFixed(2)}</td></tr>`; });
        if(document.getElementById('fac-productos')) document.getElementById('fac-productos').innerHTML = html;
        
        if(document.getElementById('fac-subtotal')) document.getElementById('fac-subtotal').textContent = `$${orden.totales.subtotal.toFixed(2)}`;
        if(document.getElementById('fac-total')) document.getElementById('fac-total').textContent = `$${orden.totales.totalUSD.toFixed(2)}`;
        
        const pagoInfo = document.getElementById('fac-pago-info');
        if (pagoInfo) {
            if (orden.pago.metodo === 'pagomovil') pagoInfo.innerHTML = `<h4 style="margin:0 0 10px 0; color:#1565c0;"><i class="fas fa-mobile-alt"></i> Pago Móvil (BNC)</h4><p style="margin:5px 0;"><strong>Monto:</strong> ${orden.totales.totalBS.toLocaleString('es-VE', {minimumFractionDigits:2})} Bs (Tasa: ${orden.pago.tasa})</p><p style="margin:5px 0;"><strong>Referencia:</strong> #${orden.pago.referencia}</p>`;
            else { pagoInfo.style.background = '#e8f8f5'; pagoInfo.style.borderColor = '#a3e4d7'; pagoInfo.innerHTML = `<h4 style="margin:0 0 10px 0; color:#27ae60;"><i class="fas fa-money-bill-wave"></i> Pago en Efectivo</h4><p style="margin:0;">Pagar exacto: <strong>$${orden.totales.totalUSD.toFixed(2)}</strong> al entregar.</p>`; }
        }
    }

    // FORMULARIO DEL ADMIN
    const formProducto = document.getElementById('form-producto');
    if (formProducto) {
        formProducto.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btnSubmit = this.querySelector('button[type="submit"]');
            const txtOriginal = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...'; btnSubmit.disabled = true;

            const formData = new FormData(); 
            formData.append('id', document.getElementById('prod-id').value);
            formData.append('nombre', document.getElementById('prod-nombre').value);
            formData.append('categoria', document.getElementById('prod-categoria').value);
            formData.append('precio', document.getElementById('prod-precio').value);
            formData.append('stock', document.getElementById('prod-stock').value);
            formData.append('descripcion', document.getElementById('prod-descripcion').value);
            formData.append('imagen_actual', document.getElementById('prod-imagen-actual').value);
            
            const archivoImg = document.getElementById('prod-imagen').files[0];
            if (archivoImg) formData.append('imagen_archivo', archivoImg);
            formData.append('rol_usuario', sesionActual ? sesionActual.tipo : '');

            try {
                const response = await fetch('admin/productos_api.php?accion=guardar', { method: 'POST', body: formData });
                const data = await response.json();
                if (data.success) { mostrarNotificacionLocal(data.message, 'success'); cerrarModalProducto(); cargarInventarioAdmin(); } 
                else { mostrarNotificacionLocal(data.error, 'error'); }
            } catch (error) { mostrarNotificacionLocal('Error de conexión', 'error'); } 
            finally { btnSubmit.innerHTML = txtOriginal; btnSubmit.disabled = false; }
        });
    }

    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            mostrarConfirmacion('¿Estás seguro de que deseas vaciar el carrito?', (confirmado) => {
                if (confirmado) { localStorage.removeItem('cart'); actualizarContadorCarrito(); mostrarCarrito(); }
            });
        });
    }

    // CARGAR VISTAS
    if (window.location.pathname.endsWith('/') || window.location.pathname.includes('index.html')) cargarProductosDestacados();
    if (window.location.pathname.includes('panel_admin.html')) cargarInventarioAdmin();
    if (window.location.pathname.includes('productos.html')) cargarProductosTienda();
    if (window.location.pathname.includes('carrito.html')) mostrarCarrito();
    if (window.location.pathname.includes('mis_pedidos.html')) cargarMisPedidos();
});
