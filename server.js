const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb' }));
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'db.json');

// Función para leer db.json
function leerDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo db.json:', error);
        return { productos: [] };
    }
}

// Función para escribir en db.json
function escribirDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error escribiendo en db.json:', error);
        return false;
    }
}

// GET - Obtener todos los productos
app.get('/api/productos', (req, res) => {
    const db = leerDB();
    res.json(db);
});

// POST - Crear nuevo producto
app.post('/api/productos', (req, res) => {
    const { nombre, categoria, precio, badge, etiquetas, imagen, descripcion } = req.body;

    // Validación
    if (!nombre || !categoria || !precio || !imagen || !descripcion) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = leerDB();
    
    const nuevoProducto = {
        id: 'prd-' + Date.now(),
        nombre,
        categoria,
        precio: parseFloat(precio),
        badge: badge || '',
        etiquetas: etiquetas || [],
        imagen, // Base64 o URL
        descripcion,
        fechaPublicacion: new Date().toISOString().split('T')[0],
        likes: 0
    };

    // Agregar al inicio del array (más nuevos primero)
    db.productos.unshift(nuevoProducto);

    // Guardar en db.json
    if (escribirDB(db)) {
        res.status(201).json({ 
            success: true, 
            mensaje: 'Producto publicado exitosamente',
            producto: nuevoProducto 
        });
    } else {
        res.status(500).json({ error: 'Error al guardar el producto' });
    }
});

// DELETE - Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const db = leerDB();
  const idx = db.productos.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  db.productos.splice(idx, 1);

  if (escribirDB(db)) {
    return res.json({ success: true, mensaje: 'Producto eliminado' });
  } else {
    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// PUT - Actualizar likes
app.put('/api/productos/:id/like', (req, res) => {
    const { id } = req.params;
    const db = leerDB();

    const producto = db.productos.find(p => p.id === id);
    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    producto.likes += 1;

    if (escribirDB(db)) {
        res.json({ success: true, likes: producto.likes });
    } else {
        res.status(500).json({ error: 'Error al actualizar likes' });
    }
});

// POST - Agregar comentario a un producto
app.post('/api/productos/:id/comentarios', (req, res) => {
    const { id } = req.params;
    const { autor, texto } = req.body;

    if (!autor || !texto) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const db = leerDB();
    const producto = db.productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (!producto.comentarios) {
        producto.comentarios = [];
    }

    const nuevoComentario = {
        id: 'com-' + Date.now(),
        autor,
        texto,
        fecha: new Date().toISOString().split('T')[0]
    };

    producto.comentarios.unshift(nuevoComentario);

    if (escribirDB(db)) {
        res.status(201).json({ success: true, comentario: nuevoComentario });
    } else {
        res.status(500).json({ error: 'Error al guardar comentario' });
    }
});

// PUT - Actualizar producto
app.put('/api/productos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio, badge, etiquetas, imagen, descripcion } = req.body;
  const db = leerDB();
  const producto = db.productos.find(p => p.id === id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

  if (nombre !== undefined) producto.nombre = nombre;
  if (categoria !== undefined) producto.categoria = categoria;
  if (precio !== undefined) producto.precio = parseFloat(precio);
  if (badge !== undefined) producto.badge = badge;
  if (etiquetas !== undefined) producto.etiquetas = etiquetas;
  if (imagen !== undefined) producto.imagen = imagen;
  if (descripcion !== undefined) producto.descripcion = descripcion;

  if (escribirDB(db)) {
    res.json({ success: true, producto });
  } else {
    res.status(500).json({ error: 'Error al guardar' });
  }
});

// DELETE - Eliminar comentario de un producto
app.delete('/api/productos/:id/comentarios/:comentarioId', (req, res) => {
  const { id, comentarioId } = req.params;
  const db = leerDB();
  const producto = db.productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (!Array.isArray(producto.comentarios) || producto.comentarios.length === 0) {
    return res.status(404).json({ error: 'No hay comentarios' });
  }

  const idx = producto.comentarios.findIndex(c => c.id === comentarioId);
  if (idx === -1) {
    return res.status(404).json({ error: 'Comentario no encontrado' });
  }

  producto.comentarios.splice(idx, 1);

  if (escribirDB(db)) {
    return res.json({ success: true, mensaje: 'Comentario eliminado' });
  } else {
    return res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});