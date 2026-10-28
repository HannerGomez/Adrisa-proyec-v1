// Configuración
const CONFIG = {
  whatsappNumber: "573182881533",
  currency: "$",
  catalogPath: "/docs/CATALOGO.json",
  storeName: "ADRISA"
};

// Helpers
const formatPrice = (price) => `${CONFIG.currency} ${Number(price).toLocaleString('es-CO')}`;
const waLink = (text) => `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

// Render catálogo con filtro
async function renderCatalog(filter = "all") {
  const grid = document.getElementById('productos-grid');
  if (!grid) return;

  let items = [];
  try {
    const res = await fetch(CONFIG.catalogPath);
    if (res.ok) items = await res.json();
  } catch (e) {
    console.warn('No se pudo cargar CATALOGO.json', e);
  }

  if (!items.length) {
    grid.innerHTML = `<p style="color:#888; text-align:center;">Próximamente: nuevos diseños en la colección.</p>`;
    return;
  }

  const filtered = filter === "all" ? items : items.filter(p => (p.categoria || '').includes(filter));

  grid.innerHTML = filtered
    .filter(Boolean)
    .map((p) => {
      const sizes = Array.isArray(p.talles) ? p.talles.join(' · ') : '';
      const img = p.imagen_modelo || p.imagen_diseno || '';
      const src = img ? img : '';
      const name = p.nombre || 'Sin nombre';
      const price = formatPrice(p.precio || 0);
      const desc = p.descripcion || 'Diseño exclusivo';
      const waText = `Hola 👋 Quiero comprar: ${name}%0A%0APrecio: ${price}%0ATalle: ?%0ACantidad: ?%0A%AGracias!`;
      const tags = (p.categoria || '').split(' ').filter(Boolean).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' / ');

      return `
        <article class="product-card" data-category="${tags.toLowerCase()}">
          <div class="product-image" data-image="${src}" data-name="${name}">
            <span class="product-badge">Edición ${String(p.id).padStart(2, '0')}</span>
            ${src ? `<img src="${src}" alt="${name}" loading="lazy">` : ''}
            <button class="expand-button" type="button" aria-label="Ampliar diseño ${name}">⤢</button>
          </div>

          <div class="product-information">
            <div>
              <h3>${name}</h3>
              <p>${tags || 'Limited'}</p>
            </div>

            <a class="consult-button" href="${waLink(waText)}" target="_blank" rel="noopener noreferrer">
              Comprar
            </a>
          </div>
        </article>
      `;
    })
    .join('');
}

// Set CTA header
function setHeaderCta() {
  const cta = document.getElementById('whatsapp-cta');
  if (!cta) return;
  const waText = `Hola 👋 Quiero comprar en ${CONFIG.storeName}. ¿Cuáles son los diseños disponibles?`;
  cta.href = waLink(waText);
}

// Filtros
function initFilters() {
  document.querySelectorAll('.filter-button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCatalog(btn.dataset.filter || 'all');
    });
  });
}

// Modal
function initModal() {
  const modal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const modalClose = document.getElementById('modalClose');
  if (!modal || !modalImage || !modalClose) return;

  const openModal = (imageSource, imageDescription) => {
    modalImage.src = imageSource;
    modalImage.alt = imageDescription;
    modal.classList.add('visible');
    document.body.classList.add('modal-open');
    modalClose.focus();
  };

  const closeModal = () => {
    modal.classList.remove('visible');
    document.body.classList.remove('modal-open');
    modalImage.src = '';
  };

  document.querySelectorAll('.product-image').forEach((container) => {
    container.addEventListener('click', (event) => {
      if (event.target.tagName === "IMG" || event.target.classList.contains('expand-button')) {
        const imgEl = container.querySelector('img');
        openModal(container.dataset.image, imgEl ? imgEl.alt : '');
      }
    });
  });

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === "Escape" && modal.classList.contains('visible')) closeModal();
  });
}

// Menú móvil
function initMobileMenu() {
  const menuButton = document.getElementById('menuButton');
  const navLinks = document.getElementById('navLinks');
  if (!menuButton || !navLinks) return;

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? "×" : "☰";
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.textContent = '☰';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCatalog();
  setHeaderCta();
  initFilters();
  initModal();
  initMobileMenu();
  document.getElementById('year').textContent = new Date().getFullYear();
});
