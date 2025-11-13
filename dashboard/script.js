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

    // Datos globales
    let productosData = [];

    // Cargar datos en tiempo real
    async function cargarDatos() {
        try {
            const response = await fetch('http://localhost:3000/api/productos');
            if (!response.ok) throw new Error('Error cargando datos');
            
            const data = await response.json();
            productosData = data.productos || [];
            
            actualizarDashboard();
        } catch (error) {
            console.error('Error:', error);
        }
    }

    // Actualizar todos los datos del dashboard
    function actualizarDashboard() {
        // Calcular estadísticas
        const costoTotal = productosData.reduce((sum, p) => sum + (p.precio || 0), 0);
        const totalPublicaciones = productosData.length;
        const totalVistas = productosData.reduce((sum, p) => sum + (p.vistas || 0), 0);
        const totalLikes = productosData.reduce((sum, p) => sum + (p.likes || 0), 0);
        const totalComentarios = productosData.reduce((sum, p) => sum + ((p.comentarios || []).length), 0);

        // Promedios
        const promedioVistas = totalPublicaciones > 0 ? (totalVistas / totalPublicaciones).toFixed(2) : 0;
        const promedioLikes = totalPublicaciones > 0 ? (totalLikes / totalPublicaciones).toFixed(2) : 0;
        const promedioComentarios = totalPublicaciones > 0 ? (totalComentarios / totalPublicaciones).toFixed(2) : 0;

        // Actualizar tarjetas de resumen
        document.getElementById('costoTotal').textContent = costoTotal.toFixed(2);
        document.getElementById('costoInfo').textContent = `${totalPublicaciones} productos`;
        document.getElementById('totalPublicaciones').textContent = totalPublicaciones;
        document.getElementById('totalVistas').textContent = totalVistas;
        document.getElementById('totalLikes').textContent = totalLikes;
        document.getElementById('totalComentarios').textContent = totalComentarios;
        document.getElementById('promedioVistas').textContent = promedioVistas;
        document.getElementById('promedioLikes').textContent = promedioLikes;
        document.getElementById('promedioComentarios').textContent = promedioComentarios;

        // Llenar tabla con todos los productos ordenados por interacción
        llenarTablaProductos();

        // Mostrar productos destacados
        mostrarProductosDestacados();

        // Actualizar fecha
        const hoy = new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        document.getElementById('fechaActual').textContent = hoy;
    }

    // Llenar tabla de productos ordenados por interacción total
    function llenarTablaProductos() {
        // Ordenar por interacción (vistas + likes + comentarios)
        const productosOrdenados = [...productosData].sort((a, b) => {
            const interaccionA = (a.vistas || 0) + (a.likes || 0) + ((a.comentarios || []).length);
            const interaccionB = (b.vistas || 0) + (b.likes || 0) + ((b.comentarios || []).length);
            return interaccionB - interaccionA;
        });

        const tabla = document.getElementById('tablaProductos');
        tabla.innerHTML = productosOrdenados.slice(0, 10).map((p, idx) => `
            <tr>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td><span class="badge bg-info">${p.vistas || 0}</span></td>
                <td><span class="badge bg-danger">${p.likes || 0}</span></td>
                <td><span class="badge bg-warning text-dark">${(p.comentarios || []).length}</span></td>
                <td>S/ ${p.precio}</td>
            </tr>
        `).join('');

        if (productosOrdenados.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No hay productos</td></tr>';
        }
    }

    // Mostrar productos más destacados (grid visual)
    function mostrarProductosDestacados() {
        // Ordenar por vistas (productos más vistos)
        const productosTop = [...productosData]
            .sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
            .slice(0, 6);

        const container = document.getElementById('productosDestacados');
        container.innerHTML = productosTop.map(p => `
            <div class="col-md-4 col-lg-2 mb-4">
                <div class="product-card">
                    <div class="product-image">
                        <img src="${p.imagen}" alt="${p.nombre}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">
                        ${p.badge ? `<span class="sale-badge">${p.badge}</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h6>${p.nombre.substring(0, 30)}</h6>
                        <p class="price">S/ ${p.precio}</p>
                        <div class="product-stats">
                            <small><i class="fas fa-eye"></i> ${p.vistas || 0}</small>
                            <small><i class="fas fa-heart"></i> ${p.likes || 0}</small>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        if (productosTop.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted">No hay productos</div>';
        }
    }

    // Actualizar cada 5 segundos
    cargarDatos();
    setInterval(cargarDatos, 5000);
});