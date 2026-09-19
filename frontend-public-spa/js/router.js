/**
 * Enrutador SPA en Vanilla JavaScript
 * Carga vistas HTML de forma asíncrona mediante fetch() en respuesta al evento hashchange.
 */
document.addEventListener('DOMContentLoaded', () => {
  const contentArea = document.getElementById('content');

  // Mapa de rutas asociadas a las vistas HTML independientes en /views
  const routes = {
    '#inicio': 'views/inicio.html',
    '#nosotros': 'views/nosotros.html',
    '#servicios': 'views/servicios.html',
    '#contacto': 'views/contacto.html'
  };

  /**
   * Carga asíncrona de la vista seleccionada
   */
  async function loadView() {
    let hash = window.location.hash || '#inicio';

    // Fallback si la ruta no existe
    if (!routes[hash]) {
      hash = '#inicio';
    }

    const viewPath = routes[hash];

    // Mostrar indicador visual de carga
    contentArea.innerHTML = `
      <div class="loading-view">
        <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
        <p>Cargando vista asíncrona desde ${viewPath}...</p>
      </div>
    `;

    try {
      const response = await fetch(viewPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: No se pudo cargar ${viewPath}`);
      }

      const htmlContent = await response.text();

      // Renderizado de la plantilla en el contenedor #content sin recargar la página
      contentArea.innerHTML = htmlContent;

      // Actualizar estado de navegación activo en la barra principal
      updateActiveNavLink(hash);

    } catch (error) {
      console.error('Error en router.js:', error);
      contentArea.innerHTML = `
        <div class="glass-box" style="text-align: center; color: #ef4444;">
          <i class="fa-solid fa-triangle-exclamation fa-3x" style="margin-bottom: 1rem;"></i>
          <h2>Error al cargar la página</h2>
          <p>${error.message}</p>
          <a href="#inicio" class="btn btn-portal" style="margin-top: 1rem; display: inline-block;">Regresar al Inicio</a>
        </div>
      `;
    }
  }

  /**
   * Destaca el enlace activo en el menú de navegación
   */
  function updateActiveNavLink(activeHash) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      if (link.getAttribute('href') === activeHash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Escuchar el evento hashchange para reaccionar ante cambios de URL
  window.addEventListener('hashchange', loadView);

  // Cargar la vista inicial al cargar el DOM
  loadView();
});
