document.getElementById('inputImagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewImagen');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es muy grande. Máximo 5MB');
            this.value = '';
            previewDiv.innerHTML = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            previewDiv.innerHTML = `
                <img src="${event.target.result}" alt="Preview" style="max-width: 300px; border-radius: 8px;">
            `;
        };
        reader.readAsDataURL(file);
    } else {
        previewDiv.innerHTML = '';
    }
});

document.getElementById('formPublicar').addEventListener('submit', async function(e) {
    e.preventDefault();

    const inputImagen = document.getElementById('inputImagen');
    const file = inputImagen.files[0];

    if (!file) {
        mostrarError('Por favor selecciona una imagen');
        return;
    }

    // Convertir imagen a Base64
    const reader = new FileReader();
    reader.onload = async function(event) {
        const imagenBase64 = event.target.result;

        const nuevoProducto = {
            nombre: document.getElementById('inputNombre').value,
            categoria: document.getElementById('inputCategoria').value,
            precio: document.getElementById('inputPrecio').value,
            badge: document.getElementById('inputBadge').value,
            etiquetas: document.getElementById('inputEtiquetas').value
                .split(',')
                .map(e => e.trim())
                .filter(e => e),
            imagen: imagenBase64,
            descripcion: document.getElementById('inputDescripcion').value
        };

        try {
            const response = await fetch('http://localhost:3000/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoProducto)
            });

            const data = await response.json();

            if (response.ok) {
                mostrarExito('¡Producto publicado exitosamente!');
                document.getElementById('formPublicar').reset();
                document.getElementById('previewImagen').innerHTML = '';

                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                mostrarError(data.error || 'Error al publicar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor');
        }
    };

    reader.readAsDataURL(file);
});

function mostrarExito(mensaje) {
    const div = document.getElementById('mensajeExito');
    div.textContent = mensaje;
    div.classList.remove('d-none');
    document.getElementById('mensajeError').classList.add('d-none');
}

function mostrarError(mensaje) {
    const div = document.getElementById('mensajeError');
    div.textContent = mensaje;
    div.classList.remove('d-none');
    document.getElementById('mensajeExito').classList.add('d-none');
}