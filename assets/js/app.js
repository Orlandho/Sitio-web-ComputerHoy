// Variables globales para almacenar el estado
let productos = [];
let activeCategory = '';
let searchTerm = '';

// --- GESTIÓN DE LIKES (almacenamiento local) ---

// Función para obtener los IDs de productos que el usuario ha dado like
function getLikedSet() {
    try {
        const raw = localStorage.getItem('likedProducts');
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

// Función para guardar los IDs de productos con like
function saveLikedSet(set) {
    try {
        localStorage.setItem('likedProducts', JSON.stringify(Array.from(set)));
    } catch {}
}

// Verifica si un producto tiene like
function isLiked(productoId) {
    return getLikedSet().has(productoId);
}

// --- CARGA Y RENDERIZADO DE PRODUCTOS ---

// Función asíncrona para obtener los productos del servidor
async function cargarProductos() {
    try {
        // Hacemos la petición GET a la API
        const response = await fetch('http://localhost:3000/api/productos');

        // Si hay error en la respuesta, lanzamos excepción
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const data = await response.json();
        productos = data.productos || [];

        // Ordenamos por fecha de publicación (más reciente primero)
        productos.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        
        // Actualizamos la UI
        actualizarCategorias();
        renderizarProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensajeVacio();
    }
}

// Función principal para mostrar los productos en el feed
function renderizarProductos() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');

    // Si no existe el feed (estamos en otra página), salimos
    if (!feed) return;

    // Filtramos la lista de productos
    const items = productos.filter(p => {
        // 1. Filtro por categoría
        // Normalizamos strings (trim y minusculas) para comparar
        const categoriaProducto = String(p.categoria || '').trim().toLowerCase();
        const categoriaActiva = String(activeCategory).toLowerCase();

        if (activeCategory && categoriaProducto !== categoriaActiva) {
            return false; // No coincide la categoría
        }

        // 2. Filtro por término de búsqueda (nombre, descripción, etc)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            // Creamos strings seguros para buscar
            const nombre = String(p.nombre || '').toLowerCase();
            const descripcion = String(p.descripcion || '').toLowerCase();
            const categoria = String(p.categoria || '').toLowerCase();
            const etiquetas = (p.etiquetas || []).map(e => String(e).toLowerCase()).join(' ');

            // Verificamos si el término está en alguno de los campos
            const coincide = nombre.includes(term) || 
                           descripcion.includes(term) || 
                           categoria.includes(term) || 
                           etiquetas.includes(term);

            if (!coincide) return false;
        }

        return true; // Pasa todos los filtros
    });

    // Si no hay productos que mostrar
    if (items.length === 0) {
        feed.innerHTML = '';
        msgVacio.classList.remove('d-none');
        return;
    }

    msgVacio.classList.add('d-none');

    // Generamos el HTML para cada tarjeta
    feed.innerHTML = items.map(producto => {
        const liked = isLiked(producto.id);

        // Configuramos estilos del botón de like según el estado
        const likeBtnClass = liked ? 'btn-primary' : 'btn-outline-primary';
        const likeIcon = liked ? 'bi-heart-fill' : 'bi-heart';
        const likeAria = liked ? 'true' : 'false';

        // Retornamos el template string de la tarjeta
        return `
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
                <small class="text-muted d-block"><i class="bi bi-eye"></i> ${producto.vistas || 0} vistas</small>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm ${likeBtnClass} flex-grow-1" aria-pressed="${likeAria}" onclick="toggleLike('${producto.id}', event)">
                        <i class="bi ${likeIcon}"></i> <span id="likes-${producto.id}">${producto.likes ?? 0}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary flex-grow-1" onclick="verDetalles('${producto.id}', event)">
                        <i class="bi bi-chat"></i> Comentar (<span id="comments-${producto.id}">${(producto.comentarios || []).length || 0}</span>)
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

// Actualiza el menú desplegable de categorías
function actualizarCategorias() {
    const menu = document.getElementById('categoriaMenu');
    const btn = document.getElementById('btnCategoria');
    if (!menu) return;

    // Obtenemos categorías únicas de los productos
    const setCats = new Set();
    productos.forEach(p => {
        if (p && p.categoria) setCats.add(String(p.categoria).trim());
    });

    // Convertimos a array y ordenamos alfabéticamente
    const categorias = Array.from(setCats).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    // Limpiamos menú actual
    menu.innerHTML = '';

    // Función auxiliar para crear items del menú
    function crearItem(label, value) {
        const li = document.createElement('li');
        const btnItem = document.createElement('button');
        btnItem.type = 'button';
        btnItem.className = 'dropdown-item';
        btnItem.setAttribute('data-category', value);
        btnItem.textContent = label;

        // Al hacer click, filtramos
        btnItem.addEventListener('click', () => {
            filtrarPorCategoria(value);
            // Gestionamos la clase 'active' visualmente
            menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
            btnItem.classList.add('active');
        });

        li.appendChild(btnItem);
        return li;
    }

    // Agregamos opción "Todas"
    menu.appendChild(crearItem('Todas', ''));

    // Agregamos cada categoría encontrada
    categorias.forEach(cat => menu.appendChild(crearItem(cat, cat)));

    // Marcamos la categoría activa si existe
    const activeSelector = menu.querySelector(`[data-category="${activeCategory ?? ''}"]`);
    if (activeSelector) {
        menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
        activeSelector.classList.add('active');
    } else {
        if (btn) btn.textContent = activeCategory ? activeCategory : 'Categoría';
    }
}

// Función disparada al seleccionar una categoría
function filtrarPorCategoria(categoryLabel) {
    activeCategory = categoryLabel || '';
    const btn = document.getElementById('btnCategoria');

    // Actualizamos el texto del botón
    if (btn) btn.textContent = activeCategory ? categoryLabel : 'Categoría';

    // Re-renderizamos
    renderizarProductos();
}

// Función disparada al escribir en el buscador
function buscarProductos(termino) {
    searchTerm = termino.trim().toLowerCase();
    renderizarProductos();
}

// --- INTERACCIONES ---

// Compatibilidad hacia atrás
async function darLike(productoId, event) {
    return toggleLike(productoId, event);
}

// Manejo de likes (toggle)
let likeInFlight = new Set(); // Evita clics múltiples rápidos

async function toggleLike(productoId, event) {
    if (event) event.stopPropagation(); // Evita abrir detalles
    if (likeInFlight.has(productoId)) return; // Ya se está procesando

    const likedSet = getLikedSet();
    const yaLeGusta = likedSet.has(productoId);

    // Determinamos endpoint (dar like o quitar like)
    const endpoint = yaLeGusta ? `/api/productos/${encodeURIComponent(productoId)}/unlike` : `/api/productos/${encodeURIComponent(productoId)}/like`;

    const btn = event?.currentTarget || document.querySelector(`button[onclick*="${productoId}"]`);
    if (btn) btn.disabled = true; // Deshabilitamos temp.
    likeInFlight.add(productoId);

    try {
        const res = await fetch(endpoint, { method: 'PUT' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error('No se pudo actualizar like');

        // Actualizamos contador visual
        const likesEl = document.getElementById(`likes-${productoId}`);
        if (likesEl) likesEl.textContent = data.likes;

        // Actualizamos estado local y estilos
        if (yaLeGusta) {
            likedSet.delete(productoId);
            if (btn) {
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
                btn.setAttribute('aria-pressed', 'false');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'bi bi-heart';
            }
        } else {
            likedSet.add(productoId);
            if (btn) {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-primary');
                btn.setAttribute('aria-pressed', 'true');
                const icon = btn.querySelector('i');
                if (icon) icon.className = 'bi bi-heart-fill';
            }
        }
        saveLikedSet(likedSet);
    } catch (err) {
        console.error('Error alternando like:', err);
    } finally {
        likeInFlight.delete(productoId);
        if (btn) btn.disabled = false;
    }
}

// Navegación a detalles (incrementando vistas)
async function verDetalles(productoId, event) {
    if (event) event.stopPropagation();

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoId)}/vistas`, {
            method: 'PUT'
        });

        if (response.ok) {
            const data = await response.json();
            // Actualizamos la vista localmente si es necesario
            const producto = productos.find(p => p.id === productoId);
            if (producto) {
                producto.vistas = data.vistas;
                renderizarProductos();
            }
        }
    } catch (error) {
        console.error('Error registrando vista:', error);
    }

    sessionStorage.setItem('productoActual', productoId);
    window.location.href = 'detalles.html';
}

// Muestra mensaje cuando no hay resultados
function mostrarMensajeVacio() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (feed) feed.innerHTML = '';
    if (msgVacio) msgVacio.classList.remove('d-none');
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    // Configuración del buscador si existe en el DOM
    const inputBuscar = document.getElementById('inputBuscar');
    if (inputBuscar) {
        // Leemos query param ?q= de la URL
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            inputBuscar.value = q;
            buscarProductos(q);
        }

        // Listener para búsqueda en tiempo real
        inputBuscar.addEventListener('input', (e) => {
            const value = e.target.value || '';
            buscarProductos(value);

            // Actualizamos URL sin recargar
            const url = new URL(window.location.href);
            if (value) {
                url.searchParams.set('q', value);
            } else {
                url.searchParams.delete('q');
            }
            window.history.replaceState({}, '', url.toString());
        });
    }
});
