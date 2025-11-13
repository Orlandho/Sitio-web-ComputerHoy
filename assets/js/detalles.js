let productoActual = null;

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
                    <h1>${productoActual.nombre}</h1>
                    ${productoActual.badge ? `<span class="badge bg-warning text-dark">${productoActual.badge}</span>` : ''}
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