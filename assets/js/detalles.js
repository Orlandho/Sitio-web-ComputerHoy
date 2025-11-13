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
        const response = await fetch('http://localhost:3000/api/productos');
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
                    <button class="btn btn-warning" onclick="abrirModalEditarDetalles()">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
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
    
    // Si hay una nueva imagen, convertirla a Base64
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
        imagen: imagenData || undefined
    };

    try {
        const response = await fetch(`http://localhost:3000/api/productos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productoActualizado)
        });

        const data = await response.json();

        if (response.ok) {
            // Actualizar el producto actual
            productoActual = { ...productoActual, ...data.producto };
            
            mostrarDetalles();
            modalEditarDetalles.hide();
            alert('Producto actualizado exitosamente');
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al actualizar el producto');
    }
}

async function cargarComentarios() {
    try {
        const response = await fetch('http://localhost:3000/api/productos');
        const data = await response.json();
        
        const producto = data.productos.find(p => p.id === productoActual.id);
        const comentarios = producto.comentarios || [];
        
        const div = document.getElementById('listaComentarios');
        
        if (comentarios.length === 0) {
            div.innerHTML = '<p class="text-muted">No hay comentarios aún.</p>';
            return;
        }
        
        div.innerHTML = comentarios.map(com => `
            <div class="card mb-3">
                <div class="card-body">
                    <h6 class="card-title">${com.autor}</h6>
                    <p class="card-text">${com.texto}</p>
                    <small class="text-muted">${new Date(com.fecha).toLocaleDateString('es-ES')}</small>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error cargando comentarios:', error);
    }
}

async function darLike(productoId) {
    try {
        const response = await fetch(`http://localhost:3000/api/productos/${productoId}/like`, {
            method: 'PUT'
        });

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
        const response = await fetch(`http://localhost:3000/api/productos/${productoActual.id}/comentarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ autor, texto })
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById('formComentario').reset();
            cargarComentarios();
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

// Inicializar
document.addEventListener('DOMContentLoaded', cargarDetalles);