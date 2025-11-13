let productoActual = null;
let modalEditarDetalles = null;

// Cargar detalles del producto
async function cargarDetalles() {
    const productoId = sessionStorage.getItem('productoActual');
    if (!productoId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // usar ruta root-relative
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error cargando productos: ' + response.status);
        const data = await response.json();

        productoActual = data.productos.find(p => p.id === productoId);
        if (!productoActual) {
            window.location.href = 'index.html';
            return;
        }

        mostrarDetalles();
        cargarComentarios();
    } catch (error) {
        console.error('Error:', error);
        window.location.href = 'index.html';
    }
}

function mostrarDetalles() {
    const div = document.getElementById('detallesProducto');
    
    div.innerHTML = `
        <div class="card">
            <img src="${productoActual.imagen}" class="card-img-top" alt="${productoActual.nombre}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1>${productoActual.nombre}</h1>
                        ${productoActual.badge ? `<span class="badge bg-warning text-dark">${productoActual.badge}</span>` : ''}
                    </div>
                    <div>
                        <button class="btn btn-warning me-2" onclick="abrirModalEditarDetalles()">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger" onclick="eliminarProductoDetalles()">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
                
                <p class="text-muted mb-3">
                    <strong>Categoría:</strong> ${productoActual.categoria}
                </p>
                
                <h2 class="text-primary mb-3">S/ ${productoActual.precio}</h2>
                
                <p class="card-text mb-3">${productoActual.descripcion}</p>
                
                <div class="mb-3">
                    <strong>Etiquetas:</strong>
                    ${productoActual.etiquetas.map(e => `<span class="badge bg-secondary me-1">${e}</span>`).join('')}
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">
                        <i class="bi bi-eye"></i> ${productoActual.vistas || 0} vistas
                    </small>
                </div>
                
                <small class="text-muted">Publicado: ${new Date(productoActual.fechaPublicacion).toLocaleDateString('es-ES')}</small>
                
                <div class="mt-4">
                    <button class="btn btn-primary" onclick="darLike('${productoActual.id}')">
                        <i class="bi bi-heart"></i> Me gusta (${productoActual.likes})
                    </button>
                </div>
            </div>
        </div>
    `;
}

function abrirModalEditarDetalles() {
    // Llenar los campos del modal
    document.getElementById('edit-id-detalles').value = productoActual.id;
    document.getElementById('edit-nombre-detalles').value = productoActual.nombre;
    document.getElementById('edit-descripcion-detalles').value = productoActual.descripcion;
    document.getElementById('edit-precio-detalles').value = productoActual.precio;
    document.getElementById('edit-categoria-detalles').value = productoActual.categoria;
    document.getElementById('edit-etiquetas-detalles').value = productoActual.etiquetas.join(', ');
    document.getElementById('edit-badge-detalles').value = productoActual.badge || '';
    document.getElementById('previewImagenEditarDetalles').innerHTML = `
        <img src="${productoActual.imagen}" alt="Preview" style="max-width: 200px; border-radius: 8px;">
    `;

    // Abrir modal
    if (!modalEditarDetalles) {
        modalEditarDetalles = new bootstrap.Modal(document.getElementById('modalEditarDetalles'));
    }
    modalEditarDetalles.show();
}

document.getElementById('edit-imagen-file-detalles').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewImagenEditarDetalles');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es muy grande. Máximo 5MB');
            this.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            previewDiv.innerHTML = `
                <img src="${event.target.result}" alt="Preview" style="max-width: 200px; border-radius: 8px;">
            `;
        };
        reader.readAsDataURL(file);
    }
});

async function guardarProductoEditadoDetalles() {
    const id = document.getElementById('edit-id-detalles').value;
    const imageFile = document.getElementById('edit-imagen-file-detalles').files[0];

    let imagenData = null;
    if (imageFile) {
        imagenData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }

    const productoActualizado = {
        nombre: document.getElementById('edit-nombre-detalles').value,
        descripcion: document.getElementById('edit-descripcion-detalles').value,
        precio: document.getElementById('edit-precio-detalles').value,
        categoria: document.getElementById('edit-categoria-detalles').value,
        badge: document.getElementById('edit-badge-detalles').value,
        etiquetas: document.getElementById('edit-etiquetas-detalles').value
            .split(',')
            .map(e => e.trim())
            .filter(e => e),
        // sólo incluir imagen si existe nueva; undefined no sobrescribe in servidor si manejo correcto
        imagen: imagenData || undefined
    };

    try {
        // usar ruta root-relative; comprobar response.ok y manejar errores
        const response = await fetch(`/api/productos/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productoActualizado)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Servidor respondió ${response.status}: ${text}`);
        }

        const data = await response.json();
        // actualizar productoActual con la respuesta del servidor si viene el producto actualizado
        productoActual = { ...productoActual, ...(data.producto || {}) };

        mostrarDetalles();
        modalEditarDetalles.hide();
        alert('Producto actualizado exitosamente');
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el producto: ' + (error.message || error));
    }
}

async function cargarComentarios() {
    try {
        const response = await fetch('/api/productos');
        if (!response.ok) throw new Error('Error cargando productos: ' + response.status);
        const data = await response.json();

        const producto = data.productos.find(p => p.id === productoActual.id);
        const comentarios = producto?.comentarios || [];

        const div = document.getElementById('listaComentarios');

        if (comentarios.length === 0) {
            div.innerHTML = '<p class="text-muted">No hay comentarios aún.</p>';
            return;
        }

        // Mostrar botón eliminar junto al comentario
        div.innerHTML = comentarios.map(com => `
            <div class="card mb-3">
                <div class="card-body d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title mb-1">${com.autor}</h6>
                        <p class="card-text mb-1">${com.texto}</p>
                        <small class="text-muted">${new Date(com.fecha).toLocaleDateString('es-ES')}</small>
                    </div>
                    <div class="ms-3">
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarComentario('${com.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        document.getElementById('listaComentarios').innerHTML = '<p class="text-danger">No se pudieron cargar los comentarios.</p>';
    }
}

// Función para eliminar comentario
async function eliminarComentario(comentarioId) {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoActual.id)}/comentarios/${encodeURIComponent(comentarioId)}`, {
            method: 'DELETE'
        });

        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Servidor respondió ${response.status}: ${text}`);
        }

        // Recargar comentarios en la vista
        cargarComentarios();
    } catch (error) {
        console.error('Error al eliminar comentario:', error);
        alert('No se pudo eliminar el comentario.');
    }
}

async function darLike(productoId) {
    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoId)}/like`, { method: 'PUT' });
        if (!response.ok) throw new Error('Error al dar like: ' + response.status);
        const data = await response.json();
        if (data.success) {
            productoActual.likes = data.likes;
            mostrarDetalles();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Manejar formulario de comentarios
document.getElementById('formComentario').addEventListener('submit', async (e) => {
    e.preventDefault();
    const autor = document.getElementById('inputAutor').value;
    const texto = document.getElementById('inputTexto').value;

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoActual.id)}/comentarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autor, texto })
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error servidor: ${text}`);
        }

        const data = await response.json();
        if (data.success) {
            document.getElementById('formComentario').reset();
            cargarComentarios();
        }
    } catch (error) {
        console.error('Error:', error);
        alert('No se pudo enviar el comentario.');
    }
});

// Nueva función para eliminar producto desde la vista detalle
async function eliminarProductoDetalles() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;

    try {
        const response = await fetch(`/api/productos/${encodeURIComponent(productoActual.id)}`, {
            method: 'DELETE'
        });

        const text = await response.text();
        if (!response.ok) {
            throw new Error(`Servidor respondió ${response.status}: ${text}`);
        }

        // Redirigir al listado principal
        alert('Producto eliminado correctamente');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error eliminando producto:', error);
        alert('No se pudo eliminar el producto.');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', cargarDetalles);