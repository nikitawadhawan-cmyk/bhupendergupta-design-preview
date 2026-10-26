// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Photo viewer: click any story or gallery photo to see it large, then use arrows or swipe.
const box = document.querySelector('.lightbox');
const links = [...document.querySelectorAll('a[data-lightbox]')];
let current = 0;
let lastFocus = null;

function show(i) {
  current = (i + links.length) % links.length;
  const link = links[current];
  const img = box.querySelector('img');
  img.src = link.href;
  img.alt = link.dataset.caption || '';
  box.querySelector('figcaption').textContent = link.dataset.caption || '';
  box.querySelector('.lb-count').textContent = `${current + 1} / ${links.length}`;
  const ahead = links[(current + 1) % links.length];
  if (ahead) new Image().src = ahead.href;
}

function open(i) {
  lastFocus = document.activeElement;
  show(i);
  box.hidden = false;
  document.body.style.overflow = 'hidden';
  box.querySelector('.lb-close').focus();
}

function close() {
  box.hidden = true;
  document.body.style.overflow = '';
  box.querySelector('img').removeAttribute('src');
  lastFocus?.focus();
}

if (box && links.length) {
  links.forEach((a, i) => a.addEventListener('click', (e) => { e.preventDefault(); open(i); }));
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  box.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  let startX = null;
  box.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  });
}

// Design 2: header turns solid once you scroll past the top of the home banner.
const overHero = document.querySelector('.site-header.over-hero');
if (overHero) {
  const onScroll = () => overHero.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Design 2: destination tabs on the home page (all stories stay in the page if scripts are off).
const tabs = [...document.querySelectorAll('.j-tabs [role=tab]')];
if (tabs.length) {
  const select = (slug, scroll) => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === slug)));
    document.querySelectorAll('.j-panel').forEach((p) => { p.hidden = p.id !== `dest-${slug}`; });
    if (scroll) document.getElementById('stories').scrollIntoView({ behavior: 'smooth' });
  };
  tabs.forEach((t) => t.addEventListener('click', () => select(t.dataset.tab, false)));
  document.querySelectorAll('.j-dest-card[data-tab]').forEach((card) => card.addEventListener('click', (e) => {
    e.preventDefault();
    select(card.dataset.tab, true);
  }));
  // Phone arrows: scroll the tab row, and show each arrow only when there is more in that direction.
  const row = document.querySelector('.j-tabs');
  const prev = document.querySelector('.j-tabs-arrow.prev');
  const next = document.querySelector('.j-tabs-arrow.next');
  const updateArrows = () => {
    prev.hidden = row.scrollLeft <= 2;
    next.hidden = row.scrollLeft + row.clientWidth >= row.scrollWidth - 2;
  };
  prev.addEventListener('click', () => row.scrollBy({ left: -row.clientWidth * 0.7 }));
  next.addEventListener('click', () => row.scrollBy({ left: row.clientWidth * 0.7 }));
  row.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);
  if ('ResizeObserver' in window) new ResizeObserver(updateArrows).observe(row); // showing/hiding an arrow changes the row's width
  updateArrows();
  tabs.forEach((t) => t.addEventListener('click', () => t.scrollIntoView({ inline: 'nearest', block: 'nearest' })));

  document.getElementById('stories').classList.add('j-tabs-on');
  select(tabs[0].dataset.tab, false);
}
