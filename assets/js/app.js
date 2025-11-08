// Estado en memoria
let ADMIN = false;
let productos = []; // se inicializa después cuando el DOM esté listo
let filtroCategoria = null;
let filtroEtiqueta = null;
let terminoBusqueda = "";

// Declaraciones de referencias DOM (se asignan en DOMContentLoaded)
let listaCategorias, contEtiquetas, listaRecomend, feed, msgVacio, inputBuscar, switchAdmin;
let modalEl, modal, formProd, titleModal, selCat, fId, fNombre, fCat, fPrecio, fBadge, fEtq, fImg, fDesc, toastOk;

// Inicialización (mover consultas DOM y creación de modal aquí)
document.addEventListener("DOMContentLoaded", () => {
  // Atajos DOM (ahora sí existen los elementos)
  listaCategorias = document.getElementById("lista-categorias");
  contEtiquetas   = document.getElementById("contenedor-etiquetas");
  listaRecomend   = document.getElementById("lista-recomendados");
  feed            = document.getElementById("feed");
  msgVacio        = document.getElementById("mensaje-vacio");
  inputBuscar     = document.getElementById("input-buscar");
  switchAdmin     = document.getElementById("switch-admin");

  // Modal / Form (sólo crear si el elemento existe)
  modalEl    = document.getElementById("modalProducto");
  if (modalEl) {
    modal = new bootstrap.Modal(modalEl);
    formProd   = document.getElementById("form-producto");
    titleModal = document.getElementById("titulo-modal");
    selCat     = document.getElementById("prod-categoria");
    fId        = document.getElementById("prod-id");
    fNombre    = document.getElementById("prod-nombre");
    fCat       = document.getElementById("prod-categoria");
    fPrecio    = document.getElementById("prod-precio");
    fBadge     = document.getElementById("prod-badge");
    fEtq       = document.getElementById("prod-etiquetas");
    fImg       = document.getElementById("prod-imagen");
    fDesc      = document.getElementById("prod-descripcion");
    toastOk    = new bootstrap.Toast(document.getElementById("toast-ok"));
  }

  // Cargar productos (si tienes una función que devuelve array, úsala aquí)
  // productos = loadProductos(); // <-- solo si loadProductos devuelve datos, evitar si usa DOM

  // Resto de inicialización que depende del DOM
  if (typeof CATEGORIAS !== "undefined" && selCat) {
    CATEGORIAS.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      selCat.appendChild(opt);
    });
  }

  // Llamadas seguras: solo ejecutar si los elementos existen
  if (typeof renderCategorias === "function" && listaCategorias) renderCategorias();
  if (typeof renderEtiquetas === "function" && contEtiquetas) renderEtiquetas();
  if (typeof renderRecomendados === "function" && listaRecomend) renderRecomendados();
  if (typeof renderFeed === "function" && feed) renderFeed();

  if (inputBuscar) {
    inputBuscar.addEventListener("input", (e) => {
      terminoBusqueda = e.target.value.trim().toLowerCase();
      if (typeof renderFeed === "function") renderFeed();
    });
  }

  if (switchAdmin) {
    switchAdmin.addEventListener("change", (e) => {
      ADMIN = e.target.checked;
      toggleAdminUI(ADMIN);
    });
  }

  if (formProd) formProd.addEventListener("submit", onSubmitProducto);
  if (modalEl) modalEl.addEventListener("hidden.bs.modal", resetFormProducto);
});

// ------ Renderizadores ------
function renderCategorias() {
  listaCategorias.innerHTML = "";
  const all = document.createElement("button");
  all.className = "list-group-item list-group-item-action" + (filtroCategoria ? "" : " active");
  all.textContent = "Todas";
  all.addEventListener("click", () => { filtroCategoria = null; renderFeed(); marcarCategoria(); });
  listaCategorias.appendChild(all);

  CATEGORIAS.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "list-group-item list-group-item-action";
    btn.textContent = cat;
    btn.dataset.cat = cat;
    btn.addEventListener("click", () => {
      filtroCategoria = cat;
      renderFeed();
      marcarCategoria();
    });
    listaCategorias.appendChild(btn);
  });
  marcarCategoria();
}

function marcarCategoria() {
  [...listaCategorias.children].forEach(el => {
    if (!el.dataset.cat && !filtroCategoria) el.classList.add("active"); else el.classList.remove("active");
    if (el.dataset.cat === filtroCategoria) el.classList.add("active");
  });
}

function renderEtiquetas() {
  contEtiquetas.innerHTML = "";
  const todasEtqs = new Set();
  productos.forEach(p => p.etiquetas.forEach(t => todasEtqs.add(t)));
  // Botón "todas"
  const btnAll = badgeTag("(todas)", () => { filtroEtiqueta = null; renderFeed(); marcarEtiqueta(); });
  btnAll.classList.add(!filtroEtiqueta ? "text-bg-primary" : "text-bg-light");
  contEtiquetas.appendChild(btnAll);
  // Resto
  [...todasEtqs].sort().forEach(tag => {
    const b = badgeTag(tag, () => { filtroEtiqueta = tag; renderFeed(); marcarEtiqueta(); });
    if (filtroEtiqueta === tag) b.classList.add("text-bg-primary");
    contEtiquetas.appendChild(b);
  });
}

function marcarEtiqueta() {
  [...contEtiquetas.children].forEach(b => {
    b.classList.remove("text-bg-primary");
    b.classList.add("text-bg-light");
    if ((b.dataset.tag === filtroEtiqueta) || (!filtroEtiqueta && b.dataset.tag === "(todas)")) {
      b.classList.remove("text-bg-light");
      b.classList.add("text-bg-primary");
    }
  });
}

function renderRecomendados() {
  listaRecomend.innerHTML = "";
  // Heurística simple: prioriza "oferta" y más likes
  const recs = [...productos].sort((a,b) => {
    const ao = a.badge === "oferta" ? 1 : 0;
    const bo = b.badge === "oferta" ? 1 : 0;
    if (bo - ao !== 0) return bo - ao;
    return (b.likes||0) - (a.likes||0);
  }).slice(0, 5);

  recs.forEach(p => {
    const a = document.createElement("a");
    a.href = "#";
    a.className = "list-group-item list-group-item-action d-flex gap-2 align-items-start";
    a.innerHTML = `
      <img src="${p.imagen}" class="rounded" style="width:56px;height:56px;object-fit:>${escapeHtml(p.nombre)}</div>
        <div class="text-muted small">${p.categoria} · S/ ${p.precio.toFixed(2)}</div>
      </div>
      ${p.badge ? `<span class="badge text-bg-warning text-uppercase align-self-start">${p.badge}</span>` : ""}
    `;
    listaRecomend.appendChild(a);
  });
}

function renderFeed() {
  feed.innerHTML = "";
  const filtrados = productos.filter(p => {
    const matchCat = !filtroCategoria || p.categoria === filtroCategoria;
    const matchTag = !filtroEtiqueta || p.etiquetas.includes(filtroEtiqueta);
    const matchSearch = !terminoBusqueda ||
      p.nombre.toLowerCase().includes(terminoBusqueda) ||
      p.descripcion.toLowerCase().includes(terminoBusqueda) ||
      p.etiquetas.some(t => t.toLowerCase().includes(terminoBusqueda));
    return matchCat && matchTag && matchSearch;
  });

  msgVacio.classList.toggle("d-none", filtrados.length > 0);

  filtrados.forEach(p => {
    feed.appendChild(cardProducto(p));
  });

  toggleAdminUI(ADMIN); // Reaplicar visibilidad admin-only
}

// ------ Helpers UI ------
function badgeTag(text, onClick) {
  const span = document.createElement("span");
  span.className = "badge text-bg-light me-2 mb-2 cursor-pointer";
  span.textContent = text;
  span.dataset.tag = text;
  span.addEventListener("click", onClick);
  return span;
}

function cardProducto(p) {
  const alreadyLiked = getLike(p.id);
  const wrapper = document.createElement("div");
  wrapper.className = "card card-producto";

  wrapper.innerHTML = `
    <imgimagen}
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <h5 class="card-title mb-0">${escapeHtml(p.nombre)}</h5>
        <div class="text-nowrap">
          ${p.badge ? `<span class="badge text-bg-warning text-uppercase">${p.badge}</span>` : ""}
          <span class="badge text-bg-secondary">${p.categoria}</span>
        </div>
      </div>
      <p class="card-text text-muted small mb-2">Publicado: ${p.fechaPublicacion}</p>
      <p class="fw-semibold mb-2">S/ ${p.precio.toFixed(2)}</p>
      <p class="card-text">${escapeHtml(p.descripcion || "")}</p>
      <div class="mb-2">
        ${p.etiquetas.map(t => `<span class="badge text-bg-light me-1">${escapeHtml(t)}</span>`).join("")}
      </div>

      <div class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-primary btn-sm" data-like="${p.id}" ${alreadyLiked ? "disabled" : ""}>
            <i class="bi bi-hand-thumbs-up"></i> Me gusta
          </button>
          <span class="small text-muted" id="likes-${p.id}">${p.likes || 0} me gusta</span>
        </div>

        <div class="d-flex gap-2 admin-only">
          <button class="btn btn-outline-secondary btn-sm" data-edit="${p.id}">Editar</button>
          <button class="btn btn-outline-danger btn-sm" data-del="${p.id}">Eliminar</button>
        </div>
      </div>
    </div>
  `;

  // Eventos: like / editar / eliminar
  const btnLike = wrapper.querySelector(`[data-like="${p.id}"]`);
  btnLike.addEventListener("click", () => onLike(p.id));

  const btnEdit = wrapper.querySelector(`[data-edit="${p.id}"]`);
  const btnDel  = wrapper.querySelector(`[data-del="${p.id}"]`);
  btnEdit.addEventListener("click", () => editarProducto(p.id));
  btnDel.addEventListener("click", () => eliminarProducto(p.id));

  return wrapper;
}

function toggleAdminUI(isAdmin) {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "" : "none";
  });
}

// ------ Likes ------
function getLikeKey(id) { return `LIKE_${id}`; }
function getLike(id) { return !!localStorage.getItem(getLikeKey(id)); }
function setLike(id) { localStorage.setItem(getLikeKey(id), "1"); }
function onLike(id) {
  if (getLike(id)) return;
  setLike(id);
  // Incremento en datos
  const p = productos.find(x => x.id === id);
  p.likes = (p.likes || 0) + 1;
  saveProductos(productos);
  // Actualizar UI puntual
  const span = document.getElementById(`likes-${id}`);
  if (span) span.textContent = `${p.likes} me gusta`;
  const btn = document.querySelector(`[data-like="${id}"]`);
  if (btn) btn.disabled = true;
  renderRecomendados(); // Puede afectar orden
}

// ------ CRUD Productos (MVP sin backend) ------
function resetFormProducto() {
  formProd.reset();
  fId.value = "";
  titleModal.textContent = "Nuevo producto";
}

function onSubmitProducto(e) {
  e.preventDefault();
  const isEdit = !!fId.value;
  const nuevo = {
    id: isEdit ? fId.value : genId(),
    nombre: fNombre.value.trim(),
    categoria: fCat.value,
    precio: Number(fPrecio.value),
    badge: fBadge.value.trim(),
    etiquetas: fEtq.value.split(",").map(x => x.trim()).filter(Boolean),
    imagen: fImg.value.trim(),
    descripcion: fDesc.value.trim(),
    fechaPublicacion: new Date().toISOString().slice(0,10),
    likes: isEdit ? (productos.find(p => p.id === fId.value)?.likes || 0) : 0
  };

  if (isEdit) {
    const idx = productos.findIndex(p => p.id === fId.value);
    productos[idx] = nuevo;
  } else {
    productos.unshift(nuevo); // aparece arriba
  }
  saveProductos(productos);
  modal.hide();
  toastOk.show();
  renderEtiquetas();
  renderFeed();
  renderRecomendados();
}

function editarProducto(id) {
  const p = productos.find(x => x.id === id);
  if (!p) return;
  titleModal.textContent = "Editar producto";
  fId.value = p.id;
  fNombre.value = p.nombre;
  fCat.value = p.categoria;
  fPrecio.value = p.precio;
  fBadge.value = p.badge || "";
  fEtq.value = p.etiquetas.join(", ");
  fImg.value = p.imagen;
  fDesc.value = p.descripcion || "";
  modal.show();
}

function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  productos = productos.filter(p => p.id !== id);
  saveProductos(productos);
  renderEtiquetas();
  renderFeed();
  renderRecomendados();
}

// ------ Utilidades ------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function genId() {
  return "prd-" + Math.random().toString(36).slice(2,8);
}

// Evita 'loadProductos is not defined' con una implementación mínima
function loadProductos() {
    const feed = document.getElementById('feed');
    const mensaje = document.getElementById('mensaje-vacio');
    if (!feed) return;

    // Ejemplo: insertar una tarjeta de ejemplo
    feed.innerHTML = `
      <div class="card card-producto">
        <img src="https://picsum.photos/600/300?random=1" class="card-img-top" alt="Producto ejemplo">
        <div class="card-body">
          <h5 class="card-title">Producto de prueba</h5>
          <p class="card-text text-muted">Descripción breve del producto.</p>
        </div>
      </div>
    `;
    // Ocultar mensaje vacío
    if (mensaje) mensaje.classList.add('d-none');
}

// Llamada inicial (si antes se llamaba desde aquí)
document.addEventListener('DOMContentLoaded', loadProductos);