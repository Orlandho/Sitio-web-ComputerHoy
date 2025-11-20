# ComputerHoy

Plataforma web tipo red social para la promoción y gestión de productos electrónicos y electrodomésticos.

## 📋 Descripción

ComputerHoy es una aplicación web que simula una red social especializada en productos tecnológicos. Permite a los usuarios publicar productos con imágenes, interactuar mediante likes y comentarios, filtrar por categorías, realizar búsquedas en tiempo real y consultar estadísticas detalladas en un dashboard administrativo.

## ✨ Características

- **Publicación de productos**: Formulario completo con carga de imágenes en Base64, categorías, etiquetas y descripción
- **Interacción social**: Sistema de likes, contador de vistas automático y comentarios en cada producto
- **Búsqueda y filtrado**: Buscador en tiempo real y filtrado dinámico por categorías
- **Dashboard de métricas**: Panel con estadísticas en tiempo real, rankings y productos destacados
- **Gestión completa**: Edición y eliminación de productos y comentarios desde la interfaz
- **Diseño responsive**: Adaptable a dispositivos móviles, tablets y escritorio

## 🛠️ Tecnologías

### Frontend
- HTML5
- CSS3 (con variables personalizadas y diseño responsive)
- JavaScript ES6+ (fetch, async/await, manipulación del DOM)
- Bootstrap 5.3.8
- Bootstrap Icons

### Backend
- Node.js
- Express.js
- body-parser (límite 50MB para imágenes Base64)
- CORS
- fs (persistencia en archivo JSON)

### Base de Datos
- db.json (almacenamiento en formato JSON plano)

## 📁 Estructura del Proyecto

```
sitioweb/
├── index.html              # Página principal con feed
├── publicar.html           # Formulario de publicación
├── detalles.html           # Vista detallada de producto
├── server.js               # Servidor Node.js con API REST
├── db.json                 # Base de datos JSON
├── package.json            # Dependencias del proyecto
├── assets/
│   ├── css/
│   │   └── styles.css      # Estilos personalizados
│   ├── js/
│   │   ├── app.js          # Lógica del feed principal
│   │   ├── publicar.js     # Lógica de publicación
│   │   └── detalles.js     # Lógica de vista detallada
│   └── images/
│       └── computerHoy.png # Logo del sitio
└── dashboard/
    ├── indexDashboard.html # Panel de estadísticas
    ├── script.js           # Lógica del dashboard
    └── style.css           # Estilos del dashboard
```

## 🚀 Instalación

### Requisitos previos
- Node.js (v14 o superior)
- npm

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Orlandho/Sitio-web-ComputerHoy.git
cd sitioweb
```

2. Instalar dependencias:
```bash
npm install express cors body-parser
```

3. Iniciar el servidor:
```bash
node server.js
```

4. Abrir en el navegador:
```
http://localhost:3000/index.html
```

## 📡 API REST

El servidor expone los siguientes endpoints:

### Productos
- `GET /api/productos` - Obtener todos los productos
- `POST /api/productos` - Crear nuevo producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto

### Interacciones
- `PUT /api/productos/:id/like` - Incrementar likes
- `PUT /api/productos/:id/vistas` - Incrementar vistas

### Comentarios
- `POST /api/productos/:id/comentarios` - Agregar comentario
- `DELETE /api/productos/:id/comentarios/:comentarioId` - Eliminar comentario

### Estadísticas
- `GET /api/dashboard/stats` - Obtener métricas agregadas

## 💾 Modelo de Datos

### Producto
```javascript
{
  id: "prd-1234567890",
  nombre: "Laptop Gamer",
  categoria: "Computadoras",
  precio: 1299.99,
  badge: "Oferta",
  etiquetas: ["gaming", "alta-gama", "rgb"],
  imagen: "data:image/jpeg;base64,...",
  descripcion: "Laptop potente para gaming",
  fechaPublicacion: "2025-11-19",
  likes: 15,
  vistas: 120,
  comentarios: [...]
}
```

### Comentario
```javascript
{
  id: "com-1234567890",
  autor: "Usuario",
  texto: "Excelente producto",
  fecha: "2025-11-19"
}
```

## 🎨 Guía de Estilos

- **Colores principales**: Azul intenso (#0d6efd) y degradados
- **Tipografía**: Calibri, sistema sans-serif
- **Componentes**: Cards con sombra, badges, botones outline
- **Responsive**: Grid 3→2→1 columnas según breakpoints
- **Animaciones**: Transiciones suaves en hover

## 🔒 Seguridad

- Validación de datos en formularios (HTML5)
- Verificación de campos obligatorios en backend
- Sanitización de HTML en dashboard (prevención XSS)
- Validación de tamaño de imágenes (máx. 5MB)
- Manejo de errores con códigos HTTP apropiados

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Orlandho**
- GitHub: [@Orlandho](https://github.com/Orlandho)
- Repositorio: [Sitio-web-ComputerHoy](https://github.com/Orlandho/Sitio-web-ComputerHoy)

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio de GitHub.

---

⭐ Si este proyecto te fue útil, considera darle una estrella en GitHub
