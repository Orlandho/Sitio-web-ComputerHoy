const REFRESH_MS = 5000;
let usandoRutaStats = true;

document.addEventListener('DOMContentLoaded', () => {
    actualizar();
    setInterval(actualizar, REFRESH_MS);
});

async function actualizar() {
    let datos = null;
    if (usandoRutaStats) {
        datos = await fetchStatsAPI();
        if (!datos) {
            usandoRutaStats = false;
        }
    }
    if (!datos) {
        datos = await fetchProductosFallback();
    }
    if (!datos) return;
    renderStats(datos);
}

async function fetchStatsAPI() {
    try {
        const res = await fetch('/api/dashboard/stats');
        if (!res.ok) return null;
        const json = await res.json();
        if (!json.success) return null;
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
            topByViews: json.topByViews,
            ultimaPublicacion: json.ultimaPublicacion || null
        };
    } catch (e) {
        console.warn('Fallo /api/dashboard/stats:', e.message);
        return null;
    }
}

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
            badge: p.badge||'',
            fechaPublicacion: p.fechaPublicacion||null
        }));
        const topByInteraction = [...mapped].sort((a,b)=>(b.vistas+b.likes+b.comentarios)-(a.vistas+a.likes+a.comentarios)).slice(0,10);
        const topByViews = [...mapped].sort((a,b)=> b.vistas - a.vistas).slice(0,10);
        
        const sortedByDate = [...productos].sort((a,b)=>{
            const dA = new Date(a.fechaPublicacion||0);
            const dB = new Date(b.fechaPublicacion||0);
            return dB - dA;
        });
        const ultimaPublicacion = sortedByDate[0] ? {
            nombre: sortedByDate[0].nombre||'',
            fechaPublicacion: sortedByDate[0].fechaPublicacion||null
        } : null;
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
            topByViews,
            ultimaPublicacion
        };
    } catch (e) {
        console.error('Fallo fallback /api/productos:', e.message);
        return null;
    }
}

function renderStats(d) {
    if(d.ultimaPublicacion){
        setText('ultimaPublicacion', d.ultimaPublicacion.nombre||'-');
        const fecha = d.ultimaPublicacion.fechaPublicacion ? new Date(d.ultimaPublicacion.fechaPublicacion).toLocaleDateString('es-ES') : '-';
        setText('fechaUltimaPublicacion', fecha);
    } else {
        setText('ultimaPublicacion', 'Sin publicaciones');
        setText('fechaUltimaPublicacion', '-');
    }
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
