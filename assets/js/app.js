let productos = [];
let activeCategory = '';
let searchTerm = '';

// Gestión de likes por dispositivo usando localStorage
function getLikedSet() {
    try {
        const raw = localStorage.getItem('likedProducts');
        const arr = raw ? JSON.parse(raw) : [];
        return new Set(Array.isArray(arr) ? arr : []);
    } catch {
        return new Set();
    }
}

function saveLikedSet(set) {
    try {
        localStorage.setItem('likedProducts', JSON.stringify(Array.from(set)));
    } catch {}
}

function isLiked(productoId) {
    return getLikedSet().has(productoId);
}

async function cargarProductos() {
    try {
        const response = await fetch('http://localhost:3000/api/productos');
        if (!response.ok) throw new Error('Error al cargar productos');
        
        const data = await response.json();
        productos = data.productos || [];
        productos.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        
        actualizarCategorias();
        renderizarProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensajeVacio();
    }
}

function renderizarProductos() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    if (!feed) return;

    const items = productos.filter(p => {
        if (activeCategory && String(p.categoria || '').toLowerCase() !== String(activeCategory).toLowerCase()) {
            return false;
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const nombre = String(p.nombre || '').toLowerCase();
            const descripcion = String(p.descripcion || '').toLowerCase();
            const categoria = String(p.categoria || '').toLowerCase();
            const etiquetas = (p.etiquetas || []).map(e => String(e).toLowerCase()).join(' ');

            const coincide = nombre.includes(term) || 
                           descripcion.includes(term) || 
                           categoria.includes(term) || 
                           etiquetas.includes(term);

            if (!coincide) return false;
        }

        return true;
    });

    if (items.length === 0) {
        feed.innerHTML = '';
        msgVacio.classList.remove('d-none');
        return;
    }

    msgVacio.classList.add('d-none');

    feed.innerHTML = items.map(producto => {
        const liked = isLiked(producto.id);
        const likeBtnClass = liked ? 'btn-primary' : 'btn-outline-primary';
        const likeIcon = liked ? 'bi-heart-fill' : 'bi-heart';
        const likeAria = liked ? 'true' : 'false';
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
                        <i class="bi bi-chat"></i> Comentar
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function actualizarCategorias() {
    const menu = document.getElementById('categoriaMenu');
    const btn = document.getElementById('btnCategoria');
    if (!menu) return;

    const setCats = new Set();
    productos.forEach(p => {
        if (p && p.categoria) setCats.add(String(p.categoria).trim());
    });

    const categorias = Array.from(setCats).sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    menu.innerHTML = '';

    function crearItem(label, value) {
        const li = document.createElement('li');
        const btnItem = document.createElement('button');
        btnItem.type = 'button';
        btnItem.className = 'dropdown-item';
        btnItem.setAttribute('data-category', value);
        btnItem.textContent = label;
        btnItem.addEventListener('click', () => {
            filtrarPorCategoria(value);
            menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
            btnItem.classList.add('active');
        });
        li.appendChild(btnItem);
        return li;
    }

    menu.appendChild(crearItem('Todas', ''));
    categorias.forEach(cat => menu.appendChild(crearItem(cat, cat)));

    const activeSelector = menu.querySelector(`[data-category="${activeCategory ?? ''}"]`);
    if (activeSelector) {
        menu.querySelectorAll('.dropdown-item').forEach(it => it.classList.remove('active'));
        activeSelector.classList.add('active');
    } else {
        if (btn) btn.textContent = activeCategory ? activeCategory : 'Categoría';
    }
}

function filtrarPorCategoria(categoryLabel) {
    activeCategory = categoryLabel || '';
    const btn = document.getElementById('btnCategoria');
    if (btn) btn.textContent = activeCategory ? categoryLabel : 'Categoría';
    renderizarProductos();
}

function buscarProductos(termino) {
    searchTerm = termino.trim().toLowerCase();
    renderizarProductos();
}

// Compatibilidad hacia atrás: redirigir a toggle
async function darLike(productoId, event) {
    return toggleLike(productoId, event);
}

// Alternar like por dispositivo
let likeInFlight = new Set();
async function toggleLike(productoId, event) {
    if (event) event.stopPropagation();
    if (likeInFlight.has(productoId)) return; // evitar doble click

    const likedSet = getLikedSet();
    const yaLeGusta = likedSet.has(productoId);
    const endpoint = yaLeGusta ? `/api/productos/${encodeURIComponent(productoId)}/unlike` : `/api/productos/${encodeURIComponent(productoId)}/like`;

    // deshabilitar botón visualmente
    const btn = event?.currentTarget || document.querySelector(`button[onclick*="${productoId}"]`);
    if (btn) btn.disabled = true;
    likeInFlight.add(productoId);

    try {
        const res = await fetch(endpoint, { method: 'PUT' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error('No se pudo actualizar like');

        const likesEl = document.getElementById(`likes-${productoId}`);
        if (likesEl) likesEl.textContent = data.likes;

        // actualizar set local y estilos del botón
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

async function verDetalles(productoId, event) {
    if (event) event.stopPropagation();

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoId)}/vistas`, {
            method: 'PUT'
        });

        if (response.ok) {
            const data = await response.json();
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

function mostrarMensajeVacio() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (feed) feed.innerHTML = '';
    if (msgVacio) msgVacio.classList.remove('d-none');
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    const inputBuscar = document.getElementById('inputBuscar');
    if (inputBuscar) {
        // Prefill from URL query (?q=)
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
            inputBuscar.value = q;
            buscarProductos(q);
        }
        inputBuscar.addEventListener('input', (e) => {
            const value = e.target.value || '';
            buscarProductos(value);
            // Reflect in URL for better shareability and SEO SearchAction
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