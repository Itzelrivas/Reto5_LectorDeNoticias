// ═══════════════════════════════════════════════
//  script.js — Lector de Noticias
//  ITZEL & ARTURO · UNAQ · 2025
// ═══════════════════════════════════════════════

// ─────────────────────────────────────────
// CONFIGURACIÓN — reemplaza con tu key real
// ─────────────────────────────────────────
const API_KEY  = "a25d26ec322da0e159de9ca46b7bd823";
const BASE_URL = "https://gnews.io/api/v4/search";

// ─────────────────────────────────────────
// REFERENCIAS AL DOM
// ─────────────────────────────────────────
const areaNoticias  = document.getElementById("area-noticias");
const spinner       = document.getElementById("spinner");
const mensajeEstado = document.getElementById("mensaje-estado");
const buscador      = document.getElementById("buscador");

// ─────────────────────────────────────────
// FUNCIÓN: mostrarSpinner
// ─────────────────────────────────────────
function mostrarSpinner(visible) {
  if (visible) {
    spinner.classList.remove("oculto");
    mensajeEstado.classList.add("oculto");
    areaNoticias.innerHTML = "";
  } else {
    spinner.classList.add("oculto");
  }
}

// ─────────────────────────────────────────
// FUNCIÓN: mostrarError
// ─────────────────────────────────────────
function mostrarError(msg) {
  mensajeEstado.textContent = msg;
  mensajeEstado.classList.remove("oculto");
  spinner.classList.add("oculto");
}

// ─────────────────────────────────────────
// FUNCIÓN: formatearFecha
// ─────────────────────────────────────────
function formatearFecha(isoString) {
  const fecha = new Date(isoString);
  return fecha.toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric"
  });
}

// ─────────────────────────────────────────
// FUNCIÓN: crearTarjeta
//   Recibe un objeto noticia del JSON y
//   devuelve un <article> con la tarjeta.
// ─────────────────────────────────────────
function crearTarjeta(noticia) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("tarjeta");

  // Clic en la tarjeta → abre la noticia completa en nueva pestaña
  tarjeta.addEventListener("click", () => {
    window.open(noticia.url, "_blank");
  });

  const imgSrc = noticia.image ||
    "https://placehold.co/600x300/1a1a2e/e94560?text=Sin+imagen";

  tarjeta.innerHTML = `
    <img
      class="tarjeta-imagen"
      src="${imgSrc}"
      alt="${noticia.title}"
      onerror="this.src='https://placehold.co/600x300/1a1a2e/e94560?text=Sin+imagen'"
    />
    <div class="tarjeta-cuerpo">
      <span class="tarjeta-fuente">${noticia.source?.name || "Fuente desconocida"}</span>
      <h2 class="tarjeta-titulo">${noticia.title}</h2>
      <p class="tarjeta-descripcion">${noticia.description || ""}</p>
      <p class="tarjeta-fecha">📅 ${formatearFecha(noticia.publishedAt)}</p>
    </div>
  `;

  return tarjeta;
}

// ─────────────────────────────────────────
// FUNCIÓN: renderizarNoticias
//   Inserta todas las tarjetas en el DOM.
// ─────────────────────────────────────────
function renderizarNoticias(noticias) {
  areaNoticias.innerHTML = "";

  if (!noticias || noticias.length === 0) {
    mostrarError("No se encontraron noticias para esa búsqueda.");
    return;
  }

  noticias.forEach(noticia => {
    areaNoticias.appendChild(crearTarjeta(noticia));
  });
}

// ─────────────────────────────────────────
// FUNCIÓN: fetchNoticias  ← FETCH + JSON
//   Hace la petición a GNews API,
//   procesa el JSON y maneja errores.
// ─────────────────────────────────────────
async function fetchNoticias(query = "technology") {
  mostrarSpinner(true);

  // Construcción de la URL con parámetros
  const params = new URLSearchParams({
    q:        query,
    lang:     "es",
    country:  "mx",
    max:      "10",
    apikey:   API_KEY
  });

  const url = `${BASE_URL}?${params.toString()}`;

  try {
    // FETCH: petición HTTP GET a la API
    const respuesta = await fetch(url);

    // Verificar código de respuesta
    if (!respuesta.ok) {
      throw new Error(`Error HTTP ${respuesta.status}`);
    }

    // Convertir respuesta a JSON
    const datos = await respuesta.json();

    // Extraer array de artículos del JSON
    // Estructura GNews: datos.articles → array de noticias
    const noticias = datos.articles;

    mostrarSpinner(false);
    renderizarNoticias(noticias);

  } catch (error) {
    console.error("Error al obtener noticias:", error);
    mostrarError("⚠️ No se pudieron cargar las noticias. Verifica tu API key o conexión a internet.");
  }
}

// ─────────────────────────────────────────
// FUNCIÓN: cargarNoticias — botón Refrescar
// ─────────────────────────────────────────
function cargarNoticias() {
  const tema = buscador.value.trim() || "technology";
  fetchNoticias(tema);
}

// ─────────────────────────────────────────
// FUNCIÓN: buscarNoticias — botón Buscar
// ─────────────────────────────────────────
function buscarNoticias() {
  const tema = buscador.value.trim();
  if (!tema) { buscador.focus(); return; }
  fetchNoticias(tema);
}

// ─────────────────────────────────────────
// SOPORTE: tecla Enter en el buscador
// ─────────────────────────────────────────
buscador.addEventListener("keydown", (e) => {
  if (e.key === "Enter") buscarNoticias();
});

// ─────────────────────────────────────────
// INICIO: cargar noticias al abrir la página
// ─────────────────────────────────────────
cargarNoticias();