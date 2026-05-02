// Confirmación antes de eliminar
function confirmarEliminar(mensaje) {
    return confirm(mensaje || '¿Estás seguro de eliminar este elemento?');
}

// Mostrar mensajes temporales (Alertas personalizadas)
function mostrarMensaje(mensaje, tipo = 'success') {
    // 1. Crear el contenedor de la alerta
    const div = document.createElement('div');
    div.className = `custom-alert alert-${tipo}`;
    
    // 2. Elegir el icono según el tipo
    const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    // 3. Insertar el contenido (Icono + Mensaje)
    div.innerHTML = `<i class="fas ${icono}"></i> <span>${mensaje}</span>`;
    
    // 4. Agregarla al documento
    document.body.appendChild(div);
    
    // 5. Pequeño delay para que la transición CSS funcione (animación de entrada)
    setTimeout(() => {
        div.classList.add('show');
    }, 10);
    
    // 6. Quitarla después de 3 segundos
    setTimeout(() => {
        div.classList.remove('show');
        // Esperar a que termine la animación de salida para removerla del DOM
        setTimeout(() => {
            div.remove();
        }, 300);
    }, 3000);
}

// Validar formulario de producto
function validarProducto() {
    const nombre = document.getElementById('nombre')?.value;
    const precio = document.getElementById('precio')?.value;
    const stock = document.getElementById('stock')?.value;
    
    if (!nombre || nombre.trim() === '') {
        mostrarMensaje('El nombre del producto es obligatorio', 'error');
        return false;
    }
    
    if (!precio || precio <= 0) {
        mostrarMensaje('El precio debe ser mayor a 0', 'error');
        return false;
    }
    
    if (!stock || stock < 0) {
        mostrarMensaje('El stock no puede ser negativo', 'error');
        return false;
    }
    
    return true;
}

// Animar números en estadísticas
function animarNumeros() {
    document.querySelectorAll('.stat-info h3').forEach(elemento => {
        const valor = elemento.innerText;
        if (!isNaN(parseFloat(valor))) {
            elemento.innerText = '0';
            
            let inicio = 0;
            const fin = parseFloat(valor.replace(/[^0-9.-]+/g, ''));
            const duracion = 1000;
            const incremento = fin / (duracion / 20);
            
            const intervalo = setInterval(() => {
                inicio += incremento;
                if (inicio >= fin) {
                    elemento.innerText = valor;
                    clearInterval(intervalo);
                } else {
                    elemento.innerText = Math.floor(inicio);
                }
            }, 20);
        }
    });
}

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', function() {
    animarNumeros();
    
    // Agregar confirmación a botones de eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function(e) {
            if (!confirmarEliminar('¿Estás seguro de eliminar este elemento?')) {
                e.preventDefault();
            }
        });
    });
});

// Mostrar modal de confirmación en el centro de la pantalla
function mostrarConfirmacion(mensaje, callback) {
    // Crear el fondo oscuro
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    
    // Crear la caja central
    overlay.innerHTML = `
        <div class="custom-confirm-box">
            <i class="fas fa-exclamation-circle"></i>
            <h3>${mensaje}</h3>
            <div class="custom-confirm-buttons">
                <button class="btn-confirm-no">Cancelar</button>
                <button class="btn-confirm-yes">Aceptar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Animación de entrada
    setTimeout(() => overlay.classList.add('show'), 10);

    const btnYes = overlay.querySelector('.btn-confirm-yes');
    const btnNo = overlay.querySelector('.btn-confirm-no');

    // Función para cerrar el modal con animación
    function cerrar() {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }

    // Escuchar los botones
    btnYes.addEventListener('click', () => { 
        cerrar(); 
        callback(true); // Ejecuta la acción
    });
    
    btnNo.addEventListener('click', () => { 
        cerrar(); 
        callback(false); // Cancela la acción
    });
}