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
  contEtiquetas = document.getElementById("contenedor-etiquetas");
  listaRecomend = document.getElementById("lista-recomendados");
  feed = document.getElementById("feed");
  msgVacio = document.getElementById("mensaje-vacio");
  inputBuscar = document.getElementById("input-buscar");
  switchAdmin = document.getElementById("switch-admin");


  // Modal / Form (sólo crear si el elemento existe)
  modalEl = document.getElementById("modalProducto");
  if (modalEl) {
    modal = new bootstrap.Modal(modalEl);
    formProd = document.getElementById("form-producto");
    titleModal = document.getElementById("titulo-modal");
    selCat = document.getElementById("prod-categoria");
    fId = document.getElementById("prod-id");
    fNombre = document.getElementById("prod-nombre");
    fCat = document.getElementById("prod-categoria");
    fPrecio = document.getElementById("prod-precio");
    fBadge = document.getElementById("prod-badge");
    fEtq = document.getElementById("prod-etiquetas");
    fImg = document.getElementById("prod-imagen");
    fDesc = document.getElementById("prod-descripcion");
    toastOk = new bootstrap.Toast(document.getElementById("toast-ok"));
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
  const btnBuscar = document.getElementById("btn-buscar");
  btnBuscar.addEventListener("click", () => {
    terminoBusqueda = inputBuscar.value.trim().toLowerCase();
    renderFeed();
  });


  if (switchAdmin) {
    switchAdmin.addEventListener("change", (e) => {
      ADMIN = e.target.checked;
      toggleAdminUI(ADMIN);
    });
  }

  if (formProd) formProd.addEventListener("submit", onSubmitProducto);
  if (modalEl) modalEl.addEventListener("hidden.bs.modal", resetFormProducto);

  ajustarEspacioNavbar();

  // reajustar si el usuario cambia tamaño de ventana
  window.addEventListener('resize', ajustarEspacioNavbar);

  const btnInicio = document.getElementById("btn-inicio");

  // --- Filtrar por categoría ---
  document.querySelectorAll(".filtro-categoria").forEach(btn => {
    btn.addEventListener("click", (e) => {
      filtroCategoria = e.target.dataset.cat;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      renderFeed();
    });
  });

  // --- Filtrar por badge ---
  document.querySelectorAll(".filtro-badge").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const badge = e.target.dataset.badge;
      filtroCategoria = null;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      // Filtrar solo productos con ese badge
      const filtrados = productos.filter(p => p.badge.toLowerCase() === badge.toLowerCase());
      mostrarFiltrados(filtrados);
    });
  });

  // --- Mostrar todos los productos ---
  document.getElementById("btn-todo").addEventListener("click", () => {
    filtroCategoria = null;
    filtroEtiqueta = null;
    terminoBusqueda = "";
    renderFeed();
  });



  // --- Filtrar por categoría ---
  document.querySelectorAll(".filtro-categoria").forEach(btn => {
    btn.addEventListener("click", (e) => {
      console.log("Categoría seleccionada:", e.target.dataset.cat);
      filtroCategoria = e.target.dataset.cat;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      renderFeed();
    });
  });

  // --- Filtrar por badge ---
  document.querySelectorAll(".filtro-badge").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const badge = e.target.dataset.badge;
      filtroCategoria = null;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      // Filtrar solo productos con ese badge
      const filtrados = productos.filter(p => p.badge.toLowerCase() === badge.toLowerCase());
      mostrarFiltrados(filtrados);
    });
  });

  // --- Mostrar todos los productos ---
  document.getElementById("btn-todo").addEventListener("click", () => {
    filtroCategoria = null;
    filtroEtiqueta = null;
    terminoBusqueda = "";
    renderFeed();
  });

  const formEditar = document.getElementById("formEditarProducto");

  if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!productoEditando) return alert("No hay producto cargado.");

      const dataActualizada = {
        nombre: document.getElementById("edit-nombre").value.trim(),
        descripcion: document.getElementById("edit-descripcion").value.trim(),
        precio: parseFloat(document.getElementById("edit-precio").value),
        categoria: document.getElementById("edit-categoria").value.trim(),
        imagen: document.getElementById("edit-imagen").value.trim(),
      };

      try {
        const res = await fetch(`http://localhost:3000/productos/${productoEditando.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dataActualizada)
        });

        if (!res.ok) throw new Error("Error al actualizar el producto");

        alert("Producto actualizado correctamente ✅");

        // Cerrar modal y actualizar lista
        const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarProducto"));
        modal.hide();
        productos = await loadProductos();
        renderFeed();

      } catch (error) {
        console.error(error);
        alert("No se pudo actualizar el producto ❌");
      }
    });
  } else {
    console.error("⚠️ No se encontró el formulario #formEditarProducto en el DOM.");
  }


});

function mostrarFiltrados(lista) {
  const feed = document.getElementById("feed");
  const msgVacio = document.getElementById("mensaje-vacio");
  feed.innerHTML = "";

  if (!lista || lista.length === 0) {
    msgVacio.classList.remove("d-none");
    return;
  }

  msgVacio.classList.add("d-none");

  lista.forEach(p => {
    feed.appendChild(cardProducto(p)); // 🔥 reutiliza tu función existente
  });

  // Esperar que el DOM esté completamente listo
  const menuCategorias = document.getElementById("menu-categorias");

  // Si el menú aún no está en el DOM (por orden de script), esperar un momento
  if (!menuCategorias) {
    console.warn("⚠️ El menú de categorías aún no existe. Esperando...");
    setTimeout(initMenuCategorias, 500);
  } else {
    initMenuCategorias();
  }

  function initMenuCategorias() {
    const menu = document.getElementById("menu-categorias");
    if (!menu) return console.error("❌ No se encontró el menú de categorías en el DOM.");

    console.log("✅ Menú de categorías detectado, activando eventos.");

    menu.addEventListener("click", (e) => {
      const catBtn = e.target.closest(".filtro-categoria");
      const badgeBtn = e.target.closest(".filtro-badge");
      const todoBtn = e.target.closest("#btn-todo");

      if (catBtn) {
        const categoria = catBtn.dataset.cat;
        filtroCategoria = categoria;
        filtroEtiqueta = null;
        terminoBusqueda = "";
        console.log("Categoría seleccionada:", categoria);
        renderFeed();
        return;
      }

      if (badgeBtn) {
        const badge = badgeBtn.dataset.badge;
        filtroCategoria = null;
        filtroEtiqueta = null;
        terminoBusqueda = "";
        console.log("Badge seleccionado:", badge);
        const filtrados = productos.filter(
          (p) => p.badge && p.badge.toLowerCase() === badge.toLowerCase()
        );
        mostrarFiltrados(filtrados);
        return;
      }

      if (todoBtn) {
        console.log("Mostrar todos los productos");
        filtroCategoria = null;
        filtroEtiqueta = null;
        terminoBusqueda = "";
        renderFeed();
      }
    });
  }


}

document.addEventListener('DOMContentLoaded', async () => {
  productos = await loadProductos();
  renderFeed(); // Usa la función existente para dibujarlos
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
  const recs = [...productos].sort((a, b) => {
    const ao = a.badge === "oferta" ? 1 : 0;
    const bo = b.badge === "oferta" ? 1 : 0;
    if (bo - ao !== 0) return bo - ao;
    return (b.likes || 0) - (a.likes || 0);
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
    const matchCat = !filtroCategoria ||
      (typeof p.categoria === "string" && p.categoria.toLowerCase() === filtroCategoria.toLowerCase());
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

  // Verificar si el usuario logueado es admin
  const userGuardado = localStorage.getItem("usuario");
  let esAdmin = false;
  if (userGuardado) {
    const user = JSON.parse(userGuardado);
    if (user.correo === "admin@demo.com" || user.id === "1") {
      esAdmin = true;
    }
  }

  wrapper.innerHTML = `
    <img src="${p.imagen}" class="card-img-top" alt="${escapeHtml(p.nombre)}">
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

        ${esAdmin ? `
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" data-edit="${p.id}">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-outline-danger btn-sm" data-del="${p.id}">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </div>` : ""}
      </div>
    </div>
  `;

  // Eventos: like
  const btnLike = wrapper.querySelector(`[data-like="${p.id}"]`);
  btnLike.addEventListener("click", () => onLike(p.id));

  // Eventos: editar / eliminar (solo si es admin)
  if (esAdmin) {
    const btnEdit = wrapper.querySelector(`[data-edit="${p.id}"]`);
    const btnDel = wrapper.querySelector(`[data-del="${p.id}"]`);

    if (btnEdit) btnEdit.addEventListener("click", () => editarProducto(p.id));
    if (btnDel) btnDel.addEventListener("click", () => eliminarProducto(p.id));
  }

  return wrapper;
}

function toggleAdminUI(isAdmin) {
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = isAdmin ? "" : "none";
  });
}

// ------ Likes ------
function getLikeKey(id, correo) {
  return `LIKE_${correo}_${id}`;
}
function getLike(id, correo) {
  return !!localStorage.getItem(getLikeKey(id, correo));
}
function setLike(id, correo) {
  localStorage.setItem(getLikeKey(id, correo), "1");
}
async function onLike(id) {
  // 🔒 Verificar si hay usuario logueado
  const userGuardado = localStorage.getItem("usuario");
  if (!userGuardado) {
    alert("Debes iniciar sesión para dar 'Me gusta' ❤️");
    return;
  }

  const usuario = JSON.parse(userGuardado);

  // ⚠️ Evitar múltiples likes del mismo usuario
  if (getLike(id, usuario.correo)) {
    alert("Ya diste 'Me gusta' a este producto 👍");
    return;
  }

  try {
    // 1️⃣ Obtener producto actual desde el servidor
    const res = await fetch(`http://localhost:3000/productos/${id}`);
    if (!res.ok) throw new Error("Error al obtener el producto");
    const producto = await res.json();

    // 2️⃣ Incrementar likes
    producto.likes = (producto.likes || 0) + 1;

    // 3️⃣ Actualizar en la base de datos
    const update = await fetch(`http://localhost:3000/productos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ likes: producto.likes })
    });

    if (!update.ok) throw new Error("Error al actualizar likes");

    // 4️⃣ Guardar en localStorage que este usuario ya dio like
    setLike(id, usuario.correo);

    // 5️⃣ Actualizar el contador en la interfaz
    const span = document.getElementById(`likes-${id}`);
    if (span) span.textContent = `${producto.likes} me gusta`;

    // 6️⃣ Deshabilitar el botón
    const btn = document.querySelector(`[data-like="${id}"]`);
    if (btn) btn.disabled = true;

    // 7️⃣ Actualizar recomendaciones si las tienes
    renderRecomendados();

  } catch (error) {
    console.error(error);
  }
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
    fechaPublicacion: new Date().toISOString().slice(0, 10),
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

let productoEditando = null;

async function editarProducto(id) {
  try {
    const res = await fetch(`http://localhost:3000/productos/${id}`);
    if (!res.ok) throw new Error("Error al obtener el producto");
    const producto = await res.json();
    productoEditando = producto;

    // Llenar los campos del formulario
    document.getElementById("edit-nombre").value = producto.nombre || "";
    document.getElementById("edit-descripcion").value = producto.descripcion || "";
    document.getElementById("edit-precio").value = producto.precio || 0;
    document.getElementById("edit-categoria").value = producto.categoria || "";
    document.getElementById("edit-imagen").value = producto.imagen || "";

    // Cambiar título del modal
    const titleModal = document.getElementById("modalEditarLabel");
    if (titleModal) titleModal.textContent = "Editar producto";

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById("modalEditarProducto"));
    modal.show();

  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el producto para editar ❌");
  }
}

function eliminarProducto(id) {
  if (!confirm("¿Eliminar este producto?")) return;
  productos = productos.filter(p => p.id !== id);
  saveProductos(productos);
  renderEtiquetas();
  renderFeed();
  renderRecomendados();
}

document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu-categorias");

  if (!menu) return console.error("❌ No se encontró #menu-categorias");

  console.log("✅ Menú de categorías listo.");

  menu.addEventListener("click", (e) => {
    const catBtn = e.target.closest(".filtro-categoria");
    const badgeBtn = e.target.closest(".filtro-badge");
    const todoBtn = e.target.closest("#btn-todo");

    if (catBtn) {
      const categoria = catBtn.dataset.cat;
      filtroCategoria = categoria;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      console.log("Categoría seleccionada:", categoria);
      renderFeed(); // 🔥 usa tu función actual de renderizado
      return;
    }

    if (badgeBtn) {
      const badge = badgeBtn.dataset.badge;
      filtroCategoria = null;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      console.log("Badge seleccionado:", badge);

      // Mostrar solo productos con ese badge
      const filtrados = productos.filter(
        (p) => p.badge && p.badge.toLowerCase() === badge.toLowerCase()
      );
      mostrarFiltrados(filtrados); // ⚙️ función auxiliar
      return;
    }

    if (todoBtn) {
      console.log("Mostrar todos los productos");
      filtroCategoria = null;
      filtroEtiqueta = null;
      terminoBusqueda = "";
      renderFeed();
    }


  });




});

async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
  if (!confirmar) return;

  try {
    const res = await fetch(`http://localhost:3000/productos/${id}`, {
      method: "DELETE"
    });

    if (!res.ok) throw new Error("Error al eliminar el producto");

    alert("Producto eliminado correctamente ✅");

    // 🔥 Vuelve a cargar los productos actualizados
    productos = await loadProductos();
    renderFeed();

  } catch (error) {
    console.error(error);
    alert("No se pudo eliminar el producto ❌");
  }
}

// Función para cargar productos desde db.json
async function cargarProductos() {
    try {
        const response = await fetch('db.json');
        if (!response.ok) throw new Error('Error al cargar db.json');
        
        const data = await response.json();
        productos = data.productos || [];
        
        // Ordenar productos por fecha (más nuevos primero)
        productos.sort((a, b) => new Date(b.fechaPublicacion) - new Date(a.fechaPublicacion));
        
        renderizarProductos();
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensajeVacio();
    }
}

// Función para renderizar los productos en el feed
function renderizarProductos() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (!feed) return;
    
    if (productos.length === 0) {
        feed.innerHTML = '';
        msgVacio.classList.remove('d-none');
        return;
    }
    
    msgVacio.classList.add('d-none');
    
    feed.innerHTML = productos.map(producto => `
        <div class="card card-producto">
            <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="card-title">${producto.nombre}</h5>
                    ${producto.badge ? `<span class="badge bg-warning text-dark">${producto.badge}</span>` : ''}
                </div>
                <p class="text-muted small">${producto.categoria}</p>
                <p class="card-text">${producto.descripcion}</p>
                <div class="mb-3">
                    <span class="badge bg-primary">S/ ${producto.precio}</span>
                </div>
                <div class="mb-3">
                    ${producto.etiquetas.map(etiqueta => `
                        <span class="badge bg-secondary me-1">${etiqueta}</span>
                    `).join('')}
                </div>
                <small class="text-muted d-block">Publicado: ${new Date(producto.fechaPublicacion).toLocaleDateString('es-ES')}</small>
                <div class="mt-3 d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-grow-1">
                        <i class="bi bi-heart"></i> ${producto.likes}
                    </button>
                    <button class="btn btn-sm btn-outline-secondary flex-grow-1">
                        <i class="bi bi-chat"></i> Comentar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para mostrar mensaje vacío
function mostrarMensajeVacio() {
    const feed = document.getElementById('feed');
    const msgVacio = document.getElementById('mensaje-vacio');
    
    if (feed) feed.innerHTML = '';
    if (msgVacio) msgVacio.classList.remove('d-none');
}

// Ajustar layout según tamaño de pantalla
function adjustLayout() {
    const feed = document.getElementById('feed');
    const windowWidth = window.innerWidth;

    if (feed) {
        if (windowWidth < 576) {
            feed.style.gridTemplateColumns = '1fr';
        } else if (windowWidth < 768) {
            feed.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else if (windowWidth < 1200) {
            feed.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else {
            feed.style.gridTemplateColumns = 'repeat(3, 1fr)';
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Cargar productos
    cargarProductos();
    
    // Ajustar layout inicial
    adjustLayout();
    
    // Configurar evento resize
    window.addEventListener('resize', adjustLayout);
});