// Menú móvil
const toggle = document.querySelector('.nav-toggle');
const menu = document.getElementById('menu');

toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.setAttribute('aria-label', open ? 'Abrir menú' : 'Cerrar menú');
  menu.classList.toggle('open', !open);
});

menu.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('open');
  })
);

// Borde del header al hacer scroll
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Pestañas de la carta (con flechas del teclado)
const tabs = [...document.querySelectorAll('[role="tab"]')];

function selectTab(tab, focus = false) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active));
    t.tabIndex = active ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tab.focus();
  tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    selectTab(tabs[(keys[e.key] + tabs.length) % tabs.length], true);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

// Ver en grande las fotos de los platos
const modal = document.querySelector('.foto-modal');
if (modal && typeof modal.showModal === 'function') {
  const modalImg = modal.querySelector('img');
  const modalNombre = modal.querySelector('.foto-nombre');

  document.querySelectorAll('.dish-foto').forEach((btn) =>
    btn.addEventListener('click', () => {
      modalImg.src = btn.dataset.foto;
      modalImg.alt = btn.dataset.nombre;
      modalNombre.textContent = btn.dataset.nombre;
      modal.showModal();
    })
  );

  modal.querySelector('.foto-cerrar').addEventListener('click', () => modal.close());
  // Cerrar al tocar fuera de la foto
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
}
