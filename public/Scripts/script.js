const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const categoriaSelect = document.getElementById('categoriaSelect');
const precioSelect = document.getElementById('precioSelect');
const buscarBtn = document.getElementById('buscarBtn');

// Elementos del modal
const modal = document.getElementById('descripcionModal');
const modalTitulo = document.getElementById('modalTitulo');
const modalDescripcion = document.getElementById('modalDescripcion');
const modalClose = document.getElementById('closeBtn');

// Cargar categorías dinámicas
async function cargarCategorias() {
  try {
    const response = await fetch('/categorias');
    const categorias = await response.json();
    categorias.forEach((categoria) => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// Buscar soluciones con filtros
async function buscarSoluciones() {
  const categoria = categoriaSelect.value;
  const precio = precioSelect.value;
  const keyword = searchInput.value;

  try {
    const response = await fetch(
      `/soluciones?categoria=${encodeURIComponent(categoria)}&precio=${encodeURIComponent(precio)}&keyword=${encodeURIComponent(keyword)}`
    );
    const resultados = await response.json();

    searchResults.innerHTML = '';
    if (resultados.length === 0) {
      searchResults.innerHTML = '<li>No se encontraron resultados.</li>';
      return;
    }

    resultados.forEach((solucion) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${solucion.nombre}</strong><br>
        <p>${solucion.descripcion}</p>
        <a href="${solucion.enlace}" target="_blank">Sitio Oficial</a>
      `;
      searchResults.appendChild(li);

      li.addEventListener('click', () => {
        mostrarDescripcionAmpliada(solucion.id, solucion.nombre);
      });
    });
  } catch (error) {
    console.error('Error al buscar soluciones:', error);
    searchResults.innerHTML = '<li>Error al buscar soluciones.</li>';
  }
}

// Mostrar modal con descripción ampliada
async function mostrarDescripcionAmpliada(solucionId, nombre) {
  try {
    const response = await fetch(`/descripcion_ampliada/${solucionId}`);
    if (response.ok) {
      const { descripcion_ampliada } = await response.json();
      modalTitulo.textContent = nombre;
      modalDescripcion.textContent = descripcion_ampliada;
      modal.style.display = 'block';
    } else {
      console.error('No se encontró la descripción ampliada.');
    }
  } catch (error) {
    console.error('Error al obtener descripción ampliada:', error);
  }
}

// Cerrar modal
modalClose.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
};

// Eventos
buscarBtn.addEventListener('click', buscarSoluciones);

// Cargar categorías cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
  cargarRecomendaciones();
});

// Cargar recomendaciones
async function cargarRecomendaciones() {
  const usuario = 'guest'; // o puedes obtenerlo dinámicamente
  try {
    const response = await fetch(`/recomendaciones?usuario=${encodeURIComponent(usuario)}`);
    const recomendaciones = await response.json();
    const contenedorRecomendaciones = document.getElementById('contenedorRecomendaciones');

    contenedorRecomendaciones.innerHTML = '';
    if (recomendaciones.length === 0) {
      contenedorRecomendaciones.innerHTML = '<p>No hay recomendaciones disponibles.</p>';
      return;
    }

    recomendaciones.forEach((recomendacion) => {
      const div = document.createElement('div');
      div.innerHTML = `
        <strong>${recomendacion.nombre}</strong><br>
        <p>${recomendacion.descripcion}</p>
        <a href="${recomendacion.enlace}" target="_blank">Sitio Oficial</a>
      `;
      contenedorRecomendaciones.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar recomendaciones:', error);
    document.getElementById('contenedorRecomendaciones').innerHTML = '<p>Error al cargar recomendaciones.</p>';
  }
}

