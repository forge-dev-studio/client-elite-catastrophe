/* ============================================
   ELITE CATASTROPHE - Main JS
   Ported from the Dasher build: header, nav,
   reveals, FAQ accordion, active-link, lazy load
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Header scroll effect ---
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-overlay');

  function closeMobileNav() {
    hamburger?.classList.remove('active');
    mobileNav?.classList.remove('active');
    overlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    const isActive = mobileNav?.classList.toggle('active');
    hamburger.classList.toggle('active');
    overlay?.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';
  });

  overlay?.addEventListener('click', closeMobileNav);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileNav));

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => observer.observe(el));
  }

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('active');

      document.querySelectorAll('.faq-item.active').forEach(open => {
        open.classList.remove('active');
        open.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Active nav link (extensionless + legacy .html both resolve) ---
  const normPath = p => p.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/+$/, '') || '/';
  const currentPath = normPath(window.location.pathname);
  document.querySelectorAll('.nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || /^(https?:|tel:|mailto:|#)/.test(href)) return;
    if (normPath(new URL(href, window.location.href).pathname) === currentPath) {
      link.classList.add('active');
    }
  });

  // --- Live review badge (static fallback text stays on any failure) ---
  async function hydrateReviewBadge() {
    const els = document.querySelectorAll('[data-review-badge]');
    if (!els.length) return;
    const endpoint = els[0].dataset.endpoint;
    if (!endpoint) return;
    try {
      const r = await fetch(endpoint, { signal: AbortSignal.timeout(2500) });
      const d = await r.json();
      const rating = d.rating, count = d.count ?? d.reviews;
      if (rating && count) {
        els.forEach(el => {
          const num = el.querySelector('[data-badge-text]') || el;
          num.textContent = `${rating}★ · ${count} Google reviews`;
        });
      }
    } catch { /* keep static fallback */ }
  }
  hydrateReviewBadge();

  // --- Contact form placeholder (GHL wiring at cutover) ---
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Request Sent!';
        form.reset();
        setTimeout(() => { btn.textContent = originalText; btn.disabled = false; }, 3000);
      }, 900);
    });
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  // --- Image lazy load ---
  if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          img.classList.add('img-loaded');
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    document.querySelectorAll('img[data-src]').forEach(img => imgObserver.observe(img));
  }

});
