// Categorías base para electrodomésticos (ajustables a tu plano/criterio)
const CATEGORIAS = [
  "Refrigeración",   // refrigeradoras, frigobares
  "Cocina",          // cocinas, hornos, microondas
  "Limpieza",        // lavadoras, secadoras, aspiradoras
  "Climatización",   // ventiladores, aires acondicionados
  "Audio/Video"      // TVs, barras de sonido
];

// Productos semilla (puedes reemplazar por los de tu plano)
const SEED_PRODUCTOS = [
  {
    id: "prd-001",
    nombre: "Refrigeradora Frost X 350L",
    categoria: "Refrigeración",
    precio: 1599.00,
    badge: "oferta",
    etiquetas: ["ahorro-energia","smart"],
    imagen: "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1200&auto=format&fit=crop",
    descripcion: "A++ eficiencia, panel touch, enfriamiento rápido.",
    fechaPublicacion: "2025-10-10",
    likes: 3
  },
  {
    id: "prd-002",
    nombre: "Lavadora AquaSpin 8kg",
    categoria: "Limpieza",
    precio: 999.90,
    badge: "nuevo",
    etiquetas: ["8kg","delicados"],
    imagen: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    descripcion: "Programas rápidos y silenciosos. Ideal departamentos.",
    fechaPublicacion: "2025-10-12",
    likes: 8
  },
  {
    id: "prd-003",
    nombre: "Smart TV 55'' 4K HDR",
    categoria: "Audio/Video",
    precio: 1799.00,
    badge: "",
    etiquetas: ["4k","hdr","dolby"],
    imagen: "https://images.unsplash.com/photo-1593359677879-6601373fdbee?q=80&w=1200&auto=format&fit=crop",
    descripcion: "HDR10+, apps preinstaladas, control por voz.",
    fechaPublicacion: "2025-10-15",
    likes: 5
  }
];

// Helper: cargar/guardar en localStorage (para pruebas)
function loadProductos() {
  const raw = localStorage.getItem("PRODUCTOS");
  if (raw) return JSON.parse(raw);
  localStorage.setItem("PRODUCTOS", JSON.stringify(SEED_PRODUCTOS));
  return [...SEED_PRODUCTOS];
}

function saveProductos(arr) {
  localStorage.setItem("PRODUCTOS", JSON.stringify(arr));
}