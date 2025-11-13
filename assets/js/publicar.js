// Vista previa de imagen
document.getElementById('inputImagen').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewImagen');
    
    if (file) {
        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es muy grande. Máximo 5MB');
            this.value = '';
            previewDiv.innerHTML = '';
            return;
        }

        // Mostrar vista previa
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

// Manejar envío del formulario
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

        // Crear objeto del producto
        const nuevoProducto = {
            id: 'prd-' + Date.now(),
            nombre: document.getElementById('inputNombre').value,
            categoria: document.getElementById('inputCategoria').value,
            precio: parseFloat(document.getElementById('inputPrecio').value),
            badge: document.getElementById('inputBadge').value,
            etiquetas: document.getElementById('inputEtiquetas').value
                .split(',')
                .map(e => e.trim())
                .filter(e => e),
            imagen: imagenBase64, // Guardamos la imagen en Base64
            descripcion: document.getElementById('inputDescripcion').value,
            fechaPublicacion: new Date().toISOString().split('T')[0],
            likes: 0
        };

        try {
            // Cargar db.json actual
            const response = await fetch('db.json');
            const data = await response.json();

            // Agregar nuevo producto
            data.productos.unshift(nuevoProducto);

            // Nota: En un servidor real, esto se guardaría en la base de datos
            // Para desarrollo local, guardamos en localStorage
            localStorage.setItem('productosComputerHoy', JSON.stringify(data.productos));

            mostrarExito('¡Producto publicado exitosamente!');
            
            // Limpiar formulario
            document.getElementById('formPublicar').reset();
            document.getElementById('previewImagen').innerHTML = '';

            // Redirigir a inicio después de 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error al publicar el producto');
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