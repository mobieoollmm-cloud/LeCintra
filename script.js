/* ===========================
   Le Cintra — JavaScript
   =========================== */

// ── Smart popup positioning (flip left if near right edge) ───
function initMenuPopupPositions() {
  const cards = document.querySelectorAll('.menu-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      const rect = card.getBoundingClientRect();
      const popupWidth = 336; // 320px + 16px gap
      const spaceRight = window.innerWidth - rect.right;
      if (spaceRight < popupWidth) {
        card.classList.add('popup-left');
      } else {
        card.classList.remove('popup-left');
      }
    });
  });
}

// ── Navbar scroll effect ──────────────────────────────────────
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
});

// ── Active nav link on scroll ─────────────────────────────────
function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    if (section.offsetTop <= scrollY && section.offsetTop + section.offsetHeight > scrollY) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// ── Mobile hamburger ──────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinksEl = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinksEl.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// ── Menu tabs ─────────────────────────────────────────────────
const tabs = document.querySelectorAll('.menu-tab');
const panels = document.querySelectorAll('.menu-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`panel-${target}`).classList.add('active');
  });
});

// ── Scroll Reveal ─────────────────────────────────────────────
function initReveal() {
  const elements = document.querySelectorAll(
    '.story-content, .story-images, .menu-card, .gallery-item, .testimonial-card, .info-card, .reservation-form, .lounge-content, .stat-item, .section-header'
  );

  elements.forEach((el, i) => {
    el.classList.add('reveal');
    if (i % 3 === 1) el.style.transitionDelay = '0.1s';
    if (i % 3 === 2) el.style.transitionDelay = '0.2s';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Counter animation ─────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

// ── Guest counter ─────────────────────────────────────────────
let guests = 2;
const guestCount = document.getElementById('guest-count');
const guestMinus = document.getElementById('guest-minus');
const guestPlus = document.getElementById('guest-plus');

guestMinus.addEventListener('click', () => {
  if (guests > 1) { guests--; guestCount.textContent = guests; }
});
guestPlus.addEventListener('click', () => {
  if (guests < 20) { guests++; guestCount.textContent = guests; }
});

// ── Reservation form ──────────────────────────────────────────
const form = document.getElementById('reservationForm');
const formSuccess = document.getElementById('formSuccess');

// Set min date to today
const dateInput = document.getElementById('res-date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('res-name').value.trim();
  const phone = document.getElementById('res-phone').value.trim();
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;

  if (!name || !phone || !date || !time) {
    shakeForm();
    return;
  }

  const btn = form.querySelector('.btn-primary');
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';
  btn.style.opacity = '0.7';
  btn.disabled = true;

  try {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, phone, date, time, guests })
    });

    if (response.ok) {
      form.style.display = 'none';
      formSuccess.style.display = 'block';
      formSuccess.style.animation = 'fadeIn 0.5s ease';
    } else {
      const data = await response.json();
      alert('Error: ' + (data.error || 'Failed to submit reservation.'));
      shakeForm();
    }
  } catch (error) {
    console.error('Error submitting reservation:', error);
    alert('A network error occurred. Please try again later.');
    shakeForm();
  } finally {
    btn.textContent = originalText;
    btn.style.opacity = '1';
    btn.disabled = false;
  }
});

function shakeForm() {
  form.style.animation = 'shake 0.4s ease';
  setTimeout(() => { form.style.animation = ''; }, 400);
}

// Inject shake keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-6px); }
    75% { transform: translateX(6px); }
  }
`;
document.head.appendChild(style);

// ── Smooth scroll for all anchor links ───────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Gallery lightbox (simple) ─────────────────────────────────
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.95);
      display:flex;align-items:center;justify-content:center;
      z-index:9999;cursor:zoom-out;animation:fadeIn 0.3s ease;
      padding:2rem;
    `;
    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.style.cssText = `
      max-width:90%;max-height:90vh;object-fit:contain;
      border:1px solid rgba(201,162,39,0.3);border-radius:4px;
      box-shadow:0 0 80px rgba(201,162,39,0.2);
    `;
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position:absolute;top:1.5rem;right:2rem;
      color:#c9a227;font-size:1.5rem;background:none;border:none;
      cursor:pointer;font-family:'Montserrat',sans-serif;
    `;
    overlay.appendChild(imgEl);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    });
  });
});

// ── Parallax on hero ──────────────────────────────────────────
const heroImg = document.querySelector('.hero-img');
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  if (heroImg && scrolled < window.innerHeight) {
    heroImg.style.transform = `scale(1) translateY(${scrolled * 0.15}px)`;
  }
}, { passive: true });

// ── Modern UI Enhancements ────────────────────────────────────

// 1. Preloader
window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    // Slight delay for premium feel
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 500);
  }
});

// 2. Custom Cursor
const cursor = document.getElementById('custom-cursor');
const cursorDot = document.getElementById('custom-cursor-dot');

if (cursor && cursorDot && window.matchMedia("(pointer: fine)").matches) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    cursorDot.style.left = e.clientX + 'px';
    cursorDot.style.top = e.clientY + 'px';
  });

  // Expand cursor on hoverable elements
  const hoverables = document.querySelectorAll('a, button, .menu-card, .gallery-item, input, select, textarea');
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
  });

  // Hide cursor when clicking
  document.addEventListener('mousedown', () => {
    cursor.classList.add('clicking');
    cursorDot.classList.add('clicking');
  });
  document.addEventListener('mouseup', () => {
    cursor.classList.remove('clicking');
    cursorDot.classList.remove('clicking');
  });
}

// 3. Scroll Progress Bar & 4. Mobile Sticky CTA
const progressBar = document.getElementById('scroll-progress-bar');
const mobileStickyCta = document.getElementById('mobile-sticky-cta');

window.addEventListener('scroll', () => {
  // Scroll Progress
  if (progressBar) {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    progressBar.style.width = scrolled + "%";
  }

  // Mobile Sticky CTA (Show after scrolling past hero section)
  if (mobileStickyCta) {
    const heroHeight = document.querySelector('.hero')?.offsetHeight || 500;
    if (window.scrollY > heroHeight) {
      mobileStickyCta.classList.add('visible');
    } else {
      mobileStickyCta.classList.remove('visible');
    }
  }
}, { passive: true });


// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initCounters();
  initMenuPopupPositions();
});
