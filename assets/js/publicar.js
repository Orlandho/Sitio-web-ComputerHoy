// Escuchamos el evento 'change' del input de imagen para mostrar la previsualización
document.getElementById('inputImagen').addEventListener('change', function(evento) {
    // Obtenemos el archivo seleccionado por el usuario
    const archivo = evento.target.files[0];
    const divPrevisualizacion = document.getElementById('previewImagen');
    
    // Verificamos si existe un archivo
    if (archivo) {
        // Validamos que sea un archivo de tipo JPEG
        if (archivo.type !== 'image/jpeg') {
            alert('Error: Solo se permiten imágenes JPEG (.jpg, .jpeg)');
            this.value = ''; // Limpiamos el input
            divPrevisualizacion.innerHTML = '';
            return;
        }

        // Validamos el tamaño (máximo 5MB)
        const tamanoMaximo = 5 * 1024 * 1024; // 5MB en bytes
        if (archivo.size > tamanoMaximo) {
            alert('El archivo es muy grande. Máximo 5MB');
            this.value = ''; // Limpiamos el input
            divPrevisualizacion.innerHTML = '';
            return;
        }

        // Usamos FileReader para leer la imagen y mostrarla
        const lector = new FileReader();
        lector.onload = function(e) {
            // Insertamos la imagen en el div de previsualización
            divPrevisualizacion.innerHTML = `
                <img src="${e.target.result}" alt="Previsualización" style="max-width: 300px; border-radius: 8px;">
            `;
        };
        // Leemos el archivo como URL de datos (Base64)
        lector.readAsDataURL(archivo);
    } else {
        // Si no hay archivo, limpiamos la previsualización
        divPrevisualizacion.innerHTML = '';
    }
});

// Manejamos el envío del formulario
document.getElementById('formPublicar').addEventListener('submit', async function(evento) {
    evento.preventDefault(); // Evitamos que la página se recargue

    const inputImagen = document.getElementById('inputImagen');
    const archivo = inputImagen.files[0];

    // Verificamos nuevamente que haya un archivo seleccionado
    if (!archivo) {
        mostrarError('Por favor selecciona una imagen');
        return;
    }

    // Leemos el archivo para enviarlo al servidor
    const lector = new FileReader();
    lector.onload = async function(e) {
        const imagenEnBase64 = e.target.result;

        // Creamos el objeto producto con los datos del formulario
        const nuevoProducto = {
            nombre: document.getElementById('inputNombre').value,
            categoria: document.getElementById('inputCategoria').value,
            precio: document.getElementById('inputPrecio').value,
            badge: document.getElementById('inputBadge').value,
            // Convertimos las etiquetas de string a array
            etiquetas: document.getElementById('inputEtiquetas').value
                .split(',')
                .map(etiqueta => etiqueta.trim()) // Quitamos espacios
                .filter(etiqueta => etiqueta),   // Quitamos etiquetas vacías
            imagen: imagenEnBase64,
            descripcion: document.getElementById('inputDescripcion').value
        };

        try {
            // Enviamos los datos al servidor usando fetch (POST)
            const respuesta = await fetch('http://localhost:3000/api/productos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoProducto)
            });

            const datos = await respuesta.json();

            // Si la respuesta es exitosa
            if (respuesta.ok) {
                mostrarExito('¡Producto publicado exitosamente!');
                document.getElementById('formPublicar').reset(); // Limpiamos el formulario
                document.getElementById('previewImagen').innerHTML = '';

                // Redirigimos a la página principal después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Si hubo error en el servidor
                mostrarError(datos.error || 'Error al publicar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarError('Error de conexión con el servidor');
        }
    };

    // Iniciamos la lectura del archivo
    lector.readAsDataURL(archivo);
});

// Función auxiliar para mostrar mensajes de éxito
function mostrarExito(mensaje) {
    const div = document.getElementById('mensajeExito');
    div.textContent = mensaje;
    div.classList.remove('d-none');
    document.getElementById('mensajeError').classList.add('d-none');
}

// Función auxiliar para mostrar mensajes de error
function mostrarError(mensaje) {
    const div = document.getElementById('mensajeError');
    div.textContent = mensaje;
    div.classList.remove('d-none');
    document.getElementById('mensajeExito').classList.add('d-none');
}
