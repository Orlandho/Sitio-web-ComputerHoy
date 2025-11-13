// Dashboard: muestra estadísticas en tiempo real de los productos.
// Estrategia:
// 1. Intentar obtener /api/dashboard/stats (si el servidor tiene la ruta).
// 2. Si falla (404 / network), hacer fallback a /api/productos y calcular en cliente.
// 3. Actualizar cada 5s. No se usan canvas ni getContext.

const REFRESH_MS = 5000;
let usandoRutaStats = true; // se ajustará automáticamente si falla.

document.addEventListener('DOMContentLoaded', () => {
    actualizar();
    setInterval(actualizar, REFRESH_MS);
});

async function actualizar() {
    let datos = null;
    if (usandoRutaStats) {
        datos = await fetchStatsAPI();
        if (!datos) {
            usandoRutaStats = false; // desactivar intento futuro y usar fallback
        }
    }
    if (!datos) {
        datos = await fetchProductosFallback();
    }
    if (!datos) return; // nada que mostrar
    renderStats(datos);
}

// Intenta obtener las estadísticas precalculadas del servidor.
async function fetchStatsAPI() {
    try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) return null; // 404 u otro -> fallback
        const json = await res.json();
        if (!json.success) return null;
        // Normalizar estructura para renderStats
        return {
            totalPublicaciones: json.stats.totalPublicaciones,
            totalCosto: json.stats.totalCosto,
            totalVistas: json.stats.totalVistas,
            totalLikes: json.stats.totalLikes,
            totalComentarios: json.stats.totalComentarios,
            promedioVistas: json.stats.promedioVistas,
            promedioLikes: json.stats.promedioLikes,
            promedioComentarios: json.stats.promedioComentarios,
            topByInteraction: json.topByInteraction,
            topByViews: json.topByViews
        };
    } catch (e) {
        console.warn('Fallo /api/dashboard/stats:', e.message);
        return null;
    }
}

// Si no existe la ruta de stats, obtener productos y calcular.
async function fetchProductosFallback() {
    try {
        const res = await fetch('/api/productos');
        if (!res.ok) return null;
        const json = await res.json();
        const productos = Array.isArray(json.productos) ? json.productos : [];
        const totalPublicaciones = productos.length;
        const totalCosto = productos.reduce((s,p)=> s + (Number(p.precio)||0), 0);
        const totalVistas = productos.reduce((s,p)=> s + (Number(p.vistas)||0), 0);
        const totalLikes = productos.reduce((s,p)=> s + (Number(p.likes)||0), 0);
        const totalComentarios = productos.reduce((s,p)=> s + ((p.comentarios||[]).length), 0);
        const promedioVistas = totalPublicaciones ? totalVistas/totalPublicaciones : 0;
        const promedioLikes = totalPublicaciones ? totalLikes/totalPublicaciones : 0;
        const promedioComentarios = totalPublicaciones ? totalComentarios/totalPublicaciones : 0;
        const mapped = productos.map(p=>({
            id: p.id,
            nombre: p.nombre||'',
            categoria: p.categoria||'',
            precio: Number(p.precio)||0,
            vistas: Number(p.vistas)||0,
            likes: Number(p.likes)||0,
            comentarios: (p.comentarios||[]).length,
            imagen: p.imagen||'',
            badge: p.badge||''
        }));
        const topByInteraction = [...mapped].sort((a,b)=>(b.vistas+b.likes+b.comentarios)-(a.vistas+a.likes+a.comentarios)).slice(0,10);
        const topByViews = [...mapped].sort((a,b)=> b.vistas - a.vistas).slice(0,10);
        return {
            totalPublicaciones,
            totalCosto,
            totalVistas,
            totalLikes,
            totalComentarios,
            promedioVistas,
            promedioLikes,
            promedioComentarios,
            topByInteraction,
            topByViews
        };
    } catch (e) {
        console.error('Fallo fallback /api/productos:', e.message);
        return null;
    }
}

function renderStats(d) {
    setText('costoTotal', (d.totalCosto||0).toFixed(2));
    setText('costoInfo', `${d.totalPublicaciones||0} productos`);
    setText('totalPublicaciones', d.totalPublicaciones||0);
    setText('totalVistas', d.totalVistas||0);
    setText('totalLikes', d.totalLikes||0);
    setText('totalComentarios', d.totalComentarios||0);
    setText('promedioVistas', (d.promedioVistas||0).toFixed(2));
    setText('promedioLikes', (d.promedioLikes||0).toFixed(2));
    setText('promedioComentarios', (d.promedioComentarios||0).toFixed(2));
    setText('fechaActual', new Date().toLocaleDateString('es-ES',{weekday:'long',year:'numeric',month:'long',day:'numeric'}));
    renderTablaProductos(d.topByInteraction||[]);
    renderProductosDestacados(d.topByViews||[]);
}

function setText(id,val){const el=document.getElementById(id);if(el)el.textContent=val;}

function renderTablaProductos(list){
    const tbody = document.getElementById('tablaProductos');
    if(!tbody) return;
    if(!list.length){
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(p=>`
        <tr>
            <td>${esc(p.nombre)}</td>
            <td>${esc(p.categoria)}</td>
            <td><span class="badge bg-info">${p.vistas}</span></td>
            <td><span class="badge bg-danger">${p.likes}</span></td>
            <td><span class="badge bg-warning text-dark">${p.comentarios}</span></td>
            <td>S/ ${p.precio.toFixed(2)}</td>
        </tr>`).join('');
}

function renderProductosDestacados(list){
    const wrap = document.getElementById('productosDestacados');
    if(!wrap) return;
    if(!list.length){
        wrap.innerHTML='<div class="col-12 text-center text-muted">No hay productos</div>';
        return;
    }
    wrap.innerHTML = list.slice(0,6).map(p=>`
        <div class="col-md-4 col-lg-2 mb-4">
            <div class="card h-100">
                <img src="${escAttr(p.imagen)}" class="card-img-top" style="height:120px;object-fit:cover;" alt="${escAttr(p.nombre)}">
                <div class="card-body p-2">
                    <h6 class="mb-1">${esc(p.nombre.substring(0,30))}</h6>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">S/ ${p.precio.toFixed(2)}</small>
                        <small><i class="fas fa-eye"></i> ${p.vistas}</small>
                    </div>
                </div>
            </div>
        </div>`).join('');
}

function esc(str){return String(str||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));}
function escAttr(str){return esc(str);} 

document.addEventListener('DOMContentLoaded', function() {
    // Asegura que el DOM (Document Object Model) esté completamente cargado
    // antes de intentar manipular los elementos HTML.

    // 1. Gráfico de Barras - Ingresos Mensuales (Sección: Resumen de Facturación)
    const monthlyRevenueCtx = document.getElementById('monthlyRevenueChart').getContext('2d');
    new Chart(monthlyRevenueCtx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'], // Etiquetas para el eje X
            datasets: [{
                label: 'Ingresos', // Etiqueta para la leyenda (aunque la ocultaremos)
                data: [90, 80, 40, 60, 50, 40, 30], // Datos de ejemplo en millones (M)
                backgroundColor: [
                    '#8B5CF6', // Morado principal
                    '#A78BFA', // Morado claro
                    '#EDE9FE', // Morado muy claro (casi blanco)
                    '#8B5CF6',
                    '#A78BFA',
                    '#EDE9FE',
                    '#8B5CF6'
                ],
                borderRadius: 5, // Bordes redondeados para las barras, visualmente atractivo
            }]
        },
        options: {
            responsive: true, // El gráfico se adaptará al tamaño de su contenedor
            maintainAspectRatio: false, // Permite que el gráfico no mantenga su relación de aspecto original
            plugins: {
                legend: {
                    display: false // No mostrar la leyenda del conjunto de datos
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            // Personaliza la etiqueta del tooltip
                            return context.dataset.label + ': $' + context.parsed.y + '.00M';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true, // El eje Y comienza en 0
                    grid: {
                        display: false // Ocultar líneas de la cuadrícula en el eje Y para un aspecto más limpio
                    },
                    ticks: {
                        callback: function(value) {
                            return value + 'M'; // Añadir 'M' a las etiquetas del eje Y (ej. 90M)
                        }
                    }
                },
                x: {
                    grid: {
                        display: false // Ocultar líneas de la cuadrícula en el eje X
                    }
                }
            }
        }
    });

    // 2. Gráfico de Dona - Estadísticas de Pedidos (Sección: Estadísticas de Pedidos)
    const orderStatsCtx = document.getElementById('orderStatsChart').getContext('2d');
    new Chart(orderStatsCtx, {
        type: 'doughnut', // Tipo de gráfico: dona
        data: {
            labels: ['Pedidos Completados', 'Pedidos en Proceso', 'Pedidos Cancelados'],
            datasets: [{
                data: [562356, 12596, 1568], // Datos de ejemplo para cada categoría
                backgroundColor: [
                    '#8B5CF6', // Morado para "Completed"
                    '#3B82F6', // Azul para "Processing"
                    '#EF4444'  // Rojo para "Cancelled"
                ],
                hoverOffset: 10 // Efecto al pasar el ratón por encima de un segmento
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Ocultar la leyenda de Chart.js ya que los detalles se muestran de forma personalizada en el HTML
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed) {
                                // Formatea el número con separadores de miles
                                label += new Intl.NumberFormat('es-PE', { style: 'decimal' }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // 3. Mini Gráfico de Línea - Tendencia de Ingresos (Dentro de "Resumen de Facturación")
    const smallLineChartCtx = document.getElementById('smallLineChart').getContext('2d');
    new Chart(smallLineChartCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
            datasets: [{
                label: 'Tendencia',
                data: [10, 12, 8, 15, 11, 13, 9], // Datos de ejemplo para la tendencia
                borderColor: '#EF4444', // Color de la línea (rojo, indicando un -15.3%)
                backgroundColor: 'rgba(239, 68, 68, 0.2)', // Relleno suave debajo de la línea
                borderWidth: 2,
                pointRadius: 0, // No mostrar puntos individuales en la línea
                tension: 0.4, // Curvatura de la línea (0.4 es un valor intermedio)
                fill: true, // Rellenar el área debajo de la línea
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                line: {
                    borderWidth: 2
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false // Deshabilitar tooltips para este mini gráfico
                }
            },
            scales: {
                x: {
                    display: false // Ocultar eje X
                },
                y: {
                    display: false // Ocultar eje Y
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    // 4. Mini Gráfico de Línea - Seguimiento de Productos (Dentro de "Seguimiento de Productos")
    const productTrackingLineChartCtx = document.getElementById('productTrackingLineChart').getContext('2d');
    new Chart(productTrackingLineChartCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
            datasets: [{
                label: 'Actividad',
                data: [5, 8, 4, 7, 6], // Datos de ejemplo para la actividad
                borderColor: '#8B5CF6', // Color morado
                backgroundColor: 'rgba(139, 92, 246, 0.2)', // Relleno morado suave
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.4,
                fill: true,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false
                }
            },
            layout: {
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    });

    // Script seguro para actualizar dashboard en tiempo real

    let productosData = [];

    // Cargar datos desde la API
    async function cargarDatos() {
        try {
            // usar root-relative para funcionar desde el servidor
            const response = await fetch('/api/productos');
            if (!response.ok) throw new Error('Error cargando datos: ' + response.status);
            const data = await response.json();
            productosData = data.productos || [];
            actualizarDashboard();
        } catch (err) {
            console.error('Error en cargarDatos:', err);
        }
    }

    function safeSetText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function actualizarDashboard() {
        const totalPublicaciones = productosData.length;
        const costoTotal = productosData.reduce((s, p) => s + (Number(p.precio) || 0), 0);
        const totalVistas = productosData.reduce((s, p) => s + (Number(p.vistas) || 0), 0);
        const totalLikes = productosData.reduce((s, p) => s + (Number(p.likes) || 0), 0);
        const totalComentarios = productosData.reduce((s, p) => s + ((p.comentarios || []).length), 0);

        const promedioVistas = totalPublicaciones ? (totalVistas / totalPublicaciones).toFixed(2) : '0';
        const promedioLikes = totalPublicaciones ? (totalLikes / totalPublicaciones).toFixed(2) : '0';
        const promedioComentarios = totalPublicaciones ? (totalComentarios / totalPublicaciones).toFixed(2) : '0';

        safeSetText('costoTotal', Number(costoTotal).toFixed(2));
        safeSetText('costoInfo', `${totalPublicaciones} productos`);
        safeSetText('totalPublicaciones', totalPublicaciones);
        safeSetText('totalVistas', totalVistas);
        safeSetText('totalLikes', totalLikes);
        safeSetText('totalComentarios', totalComentarios);
        safeSetText('promedioVistas', promedioVistas);
        safeSetText('promedioLikes', promedioLikes);
        safeSetText('promedioComentarios', promedioComentarios);
        actualizarTablaProductos();
        mostrarProductosDestacados();

        const fechaEl = document.getElementById('fechaActual');
        if (fechaEl) {
            const hoy = new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            fechaEl.textContent = hoy;
        }
    }

    function actualizarTablaProductos() {
        const tabla = document.getElementById('tablaProductos');
        if (!tabla) return;

        const productosOrdenados = [...productosData].sort((a, b) => {
            const ia = (a.vistas || 0) + (a.likes || 0) + ((a.comentarios || []).length);
            const ib = (b.vistas || 0) + (b.likes || 0) + ((b.comentarios || []).length);
            return ib - ia;
        });

        if (productosOrdenados.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos</td></tr>';
            return;
        }

        tabla.innerHTML = productosOrdenados.slice(0, 20).map(p => `
            <tr>
                <td><strong>${escapeHtml(p.nombre || '')}</strong></td>
                <td>${escapeHtml(p.categoria || '')}</td>
                <td><span class="badge bg-info">${p.vistas || 0}</span></td>
                <td><span class="badge bg-danger">${p.likes || 0}</span></td>
                <td><span class="badge bg-warning text-dark">${(p.comentarios || []).length}</span></td>
                <td>S/ ${Number(p.precio || 0).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    function mostrarProductosDestacados() {
        const container = document.getElementById('productosDestacados');
        if (!container) return;

        const productosTop = [...productosData].sort((a, b) => (b.vistas || 0) - (a.vistas || 0)).slice(0, 6);
        if (productosTop.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No hay productos</div>';
            return;
        }

        container.innerHTML = productosTop.map(p => `
            <div class="col-md-4 col-lg-2 mb-4">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${escapeAttr(p.imagen || '')}" alt="${escapeAttr(p.nombre || '')}" style="width:100%;height:150px;object-fit:cover;border-radius:8px;">
                        ${p.badge ? `<span class="sale-badge">${escapeHtml(p.badge)}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h6>${escapeHtml((p.nombre || '').substring(0, 30))}</h6>
                        <p class="price">S/ ${Number(p.precio || 0).toFixed(2)}</p>
                        <div
                            <small><i class="fas fa-eye"></i> ${p.vistas || 0}</small>
                            <small><i class="fas fa-heart"></i> ${p.likes || 0}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Script robusto para dashboard: obtiene stats desde /api/dashboard/stats y actualiza el DOM

    async function fetchDashboardStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return await res.json();
      } catch (err) {
        console.error('fetchDashboardStats error', err);
        return null;
      }
    }

    function safeSetText(id, v) {
      const el = document.getElementById(id);
      if (el) el.textContent = v;
    }

    function renderTablaProductos(list) {
      const tabla = document.getElementById('tablaProductos');
      if (!tabla) return;
      if (!list || list.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos</td></tr>';
        return;
      }
      tabla.innerHTML = list.map(p => `
        <tr>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${escapeHtml(p.categoria || '')}</td>
          <td><span class="badge bg-info">${p.vistas || 0}</span></td>
          <td><span class="badge bg-danger">${p.likes || 0}</span></td>
          <td><span class="badge bg-warning text-dark">${p.comentarios || 0}</span></td>
          <td>S/ ${Number(p.precio || 0).toFixed(2)}</td>
        </tr>
      `).join('');
    }

    function renderProductosDestacados(list) {
      const container = document.getElementById('productosDestacados');
      if (!container) return;
      if (!list || list.length === 0) {
        container.innerHTML = '<div class="col-12 text-center text-muted">No hay productos</div>';
        return;
      }
      container.innerHTML = list.slice(0,6).map(p => `
        <div class="col-md-4 col-lg-2 mb-4">
          <div class="card h-100">
            <img src="${escapeAttr(p.imagen||'')}" class="card-img-top" style="height:120px;object-fit:cover;">
            <div class="card-body p-2">
              <h6 class="mb-1">${escapeHtml((p.nombre||'').substring(0,30))}</h6>
              <div class="d-flex justify-content-between align-items-center">
                <small class="text-muted">S/ ${Number(p.precio||0).toFixed(2)}</small>
                <small><i class="fas fa-eye"></i> ${p.vistas||0}</small>
              </div>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Inicialización segura
    cargarDatos();
    // refrescar cada 5s (puedes ajustar)
    setInterval(cargarDatos, 5000);

    async function actualizar() {
      const data = await fetchDashboardStats();
      if (!data || !data.success) return;

      const stats = data.stats || {};
      safeSetText('costoTotal', Number(stats.totalCosto||0).toFixed(2));
      safeSetText('costoInfo', `${stats.totalPublicaciones||0} productos`);
      safeSetText('totalPublicaciones', stats.totalPublicaciones||0);
      safeSetText('totalVistas', stats.totalVistas||0);
      safeSetText('totalLikes', stats.totalLikes||0);
      safeSetText('totalComentarios', stats.totalComentarios||0);
      safeSetText('promedioVistas', Number(stats.promedioVistas||0).toFixed(2));
      safeSetText('promedioLikes', Number(stats.promedioLikes||0).toFixed(2));
      safeSetText('promedioComentarios', Number(stats.promedioComentarios||0).toFixed(2));

      renderTablaProductos(data.topByInteraction || []);
      renderProductosDestacados(data.topByViews || []);

      const fechaEl = document.getElementById('fechaActual');
      if (fechaEl) fechaEl.textContent = new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    }
});