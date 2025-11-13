// Estado en memoria
let ADMIN = false;
let productos = [];
let activeCategory = ''; // <--- categoría activa (vacía = mostrar todas)

// Función para cargar productos desde el servidor
async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const data = await response.json();
        productos = data.productos || [];
        productos.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        
        // actualizar UI
        actualizarCategorias(); // <-- actualizar menú de categorías
        renderizarProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensajeVacio();
    }
}

// Función para renderizar los productos
function renderizarProductos() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    if (!feed) return;

    // Filtrar por categoría activa si existe
    const items = productos.filter(p => {
        if (!activeCategory) return true;
        // normalizar mayúsculas/minúsculas
        return String(p.categoria || '').toLowerCase() === String(activeCategory).toLowerCase();
    });

    if (items.length === 0) {
        feed.innerHTML = '';
        msgVacio.classList.remove('d-none');
        return;
    }

    msgVacio.classList.add('d-none');

    feed.innerHTML = items.map(producto => `
        <div class="card card-producto cursor-pointer" onclick="verDetalles('${producto.id}')">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${producto.nombre}</h5>
                    ${producto.badge ? `<span class="badge bg-warning text-dark">${producto.badge}</span>` : ''}
                </div>
                <p class="text-muted small">${producto.categoria}</p>
                <p class="card-text">${producto.descripcion || ''}</p>
                <div class="mb-3">
                    <span class="badge bg-primary">S/ ${producto.precio ?? ''}</span>
                </div>
                <div class="mb-3">
                    ${(producto.etiquetas || []).map(etiqueta => `
                        <span class="badge bg-secondary me-1">${etiqueta}</span>
                    `).join('')}
                </div>
                <small class="text-muted d-block">Publicado: ${producto.fechaPublicacion ? new Date(producto.fechaPublicacion).toLocaleDateString('es-ES') : ''}</small>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-grow-1" onclick="darLike('${producto.id}', event)">
                        <i class="bi bi-heart"></i> <span id="likes-${producto.id}">${producto.likes ?? 0}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary flex-grow-1" onclick="verDetalles('${producto.id}', event)">
                        <i class="bi bi-chat"></i> Comentar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Nueva función: construir menú de categorías dinámicamente
function actualizarCategorias() {
    const menu = document.getElementById('categoriaMenu');
    const btn = document.getElementById('btnCategoria');
    if (!menu) return;

    // Obtener categorías únicas normales
    const setCats = new Set();
    productos.forEach(p => {
        if (p && p.categoria) setCats.add(String(p.categoria).trim());
    });

    const categorias = Array.from(setCats).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    // Limpiar menú
    menu.innerHTML = '';

    // Helper para crear item
    function crearItem(label, value) {
        const li = document.createElement('li');
        const btnItem = document.createElement('button');
        btnItem.type = 'button';
        btnItem.className = 'dropdown-item';
        btnItem.setAttribute('data-category', value);
        btnItem.textContent = label;
        btnItem.addEventListener('click', (e) => {
            filtrarPorCategoria(value);
            // marcar activo
            menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
            btnItem.classList.add('active');
        });
        li.appendChild(btnItem);
        return li;
    }

    // Item "Todas"
    menu.appendChild(crearItem('Todas', ''));

    // Items por categoría
    categorias.forEach(cat => menu.appendChild(crearItem(cat, cat)));

    // Marcar activo según activeCategory
    const activeSelector = menu.querySelector(`[data-category="${activeCategory ?? ''}"]`);
    if (activeSelector) {
        menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
        activeSelector.classList.add('active');
    } else {
        // si no hay selección, mostrar "Categoría" en el botón
        if (btn) btn.textContent = activeCategory ? activeCategory : 'Categoría';
    }
}

// Nueva función para aplicar filtro desde UI
function filtrarPorCategoria(categoryLabel) {
    activeCategory = categoryLabel || '';
    // actualizar texto del botón
    const btn = document.getElementById('btnCategoria');
    if (btn) btn.textContent = activeCategory ? categoryLabel : 'Categoría';
    renderizarProductos();
}

// Función para dar like
async function darLike(productoId, event) {
    if (event) event.stopPropagation();
    try {
        const response = await fetch(`http://localhost:3000/api/productos/${productoId}/like`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById(`likes-${productoId}`).textContent = data.likes;
        }
    } catch (error) {
        console.error('Error al dar like:', error);
    }
}

function mostrarMensajeVacio() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (feed) feed.innerHTML = '';
    if (msgVacio) msgVacio.classList.remove('d-none');
}

// Función para ajustar layout
function adjustLayout() {
    const feed = document.getElementById('feed');
    const windowWidth = window.innerWidth;

    if (feed) {
        if (windowWidth < 576) {
            feed.style.gridTemplateColumns = '1fr';
        } else if (windowWidth < 768) {
            feed.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            feed.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    adjustLayout();

    // Vincular listeners de resize
    window.addEventListener('resize', adjustLayout);
});