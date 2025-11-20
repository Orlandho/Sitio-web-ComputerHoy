const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb' }));
app.use(express.static(__dirname));

const dbPath = path.join(__dirname, 'db.json');

function leerDB() {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo db.json:', error);
        return { productos: [] };
    }
}

function escribirDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error escribiendo en db.json:', error);
        return false;
    }
}

app.get('/api/productos', (req, res) => {
    const db = leerDB();
    res.json(db);
});

app.post('/api/productos', (req, res) => {
    const { nombre, categoria, precio, badge, etiquetas, imagen, descripcion } = req.body;

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
        imagen,
        descripcion,
        fechaPublicacion: new Date().toISOString().split('T')[0],
        likes: 0
    };

    db.productos.unshift(nuevoProducto);

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

// Quitar like (decrementar) sin bajar de 0
app.put('/api/productos/:id/unlike', (req, res) => {
  const { id } = req.params;
  const db = leerDB();

  const producto = db.productos.find(p => p.id === id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const current = Number(producto.likes) || 0;
  producto.likes = current > 0 ? current - 1 : 0;

  if (escribirDB(db)) {
    return res.json({ success: true, likes: producto.likes });
  } else {
    return res.status(500).json({ error: 'Error al actualizar likes' });
  }
});

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

app.put('/api/productos/:id/vistas', (req, res) => {
  const { id } = req.params;
  const db = leerDB();
  const producto = db.productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  producto.vistas = (producto.vistas || 0) + 1;

  if (escribirDB(db)) {
    return res.json({ success: true, vistas: producto.vistas });
  } else {
    return res.status(500).json({ error: 'Error al actualizar vistas' });
  }
});

app.get('/api/dashboard/stats', (req, res) => {
  try {
    const db = leerDB();
    const productos = Array.isArray(db.productos) ? db.productos : [];

    const totalPublicaciones = productos.length;
    const totalCosto = productos.reduce((s,p) => s + (Number(p.precio) || 0), 0);
    const totalVistas = productos.reduce((s,p) => s + (Number(p.vistas) || 0), 0);
    const totalLikes = productos.reduce((s,p) => s + (Number(p.likes) || 0), 0);
    const totalComentarios = productos.reduce((s,p) => s + ((p.comentarios||[]).length || 0), 0);

    const promedioVistas = totalPublicaciones ? totalVistas / totalPublicaciones : 0;
    const promedioLikes = totalPublicaciones ? totalLikes / totalPublicaciones : 0;
    const promedioComentarios = totalPublicaciones ? totalComentarios / totalPublicaciones : 0;

    const mapped = productos.map(p => ({
      id: p.id,
      nombre: p.nombre,
      categoria: p.categoria,
      precio: Number(p.precio) || 0,
      vistas: Number(p.vistas) || 0,
      likes: Number(p.likes) || 0,
      comentarios: (p.comentarios||[]).length || 0,
      imagen: p.imagen || '',
      badge: p.badge || ''
    }));

    const topByInteraction = [...mapped].sort((a,b) => (b.vistas+b.likes+b.comentarios) - (a.vistas+a.likes+a.comentarios)).slice(0,10);
    const topByComments = [...mapped].sort((a,b) => b.comentarios - a.comentarios).slice(0,10);
    const topByLikes = [...mapped].sort((a,b) => b.likes - a.likes).slice(0,10);
    const topByViews = [...mapped].sort((a,b) => b.vistas - a.vistas).slice(0,10);

    const sortedByDate = [...productos].sort((a,b) => {
      const dA = new Date(a.fechaPublicacion || 0);
      const dB = new Date(b.fechaPublicacion || 0);
      return dB - dA;
    });
    const ultimaPublicacion = sortedByDate[0] ? {
      nombre: sortedByDate[0].nombre || '',
      fechaPublicacion: sortedByDate[0].fechaPublicacion || null
    } : null;

    res.json({
      success: true,
      stats: {
        totalPublicaciones,
        totalCosto,
        totalVistas,
        totalLikes,
        totalComentarios,
        promedioVistas,
        promedioLikes,
        promedioComentarios
      },
      topByInteraction,
      topByComments,
      topByLikes,
      topByViews,
      ultimaPublicacion
    });
  } catch (err) {
    console.error('Error /api/dashboard/stats', err);
    res.status(500).json({ success:false, error:'Error interno' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});