document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  const header = document.getElementById('siteHeader');

  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('active', open);
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  };

  toggle?.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
  menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });

  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  const heroImage = document.getElementById('heroImage');
  const slideLabel = document.getElementById('heroSlideLabel');
  const slideCount = document.getElementById('heroSlideCount');
  const slides = [
    ['images/hero-home0.jpg', 'Web experiences'],
    ['images/hero-home1.jpg', 'Creative websites'],
    ['images/hero-home2.jpg', 'Digital presence'],
    ['images/hero-home3.jpg', 'Responsive systems'],
    ['images/hero-home4.jpg', 'Growth-ready design']
  ];
  if (heroImage && slides.length > 1) {
    let current = 0;
    let timer;
    const swap = () => {
      if (reduceMotion) return;
      heroImage.classList.add('changing');
      window.setTimeout(() => {
        current = (current + 1) % slides.length;
        heroImage.src = slides[current][0];
        if (slideLabel) slideLabel.textContent = slides[current][1];
        if (slideCount) slideCount.textContent = `${String(current + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
        heroImage.classList.remove('changing');
      }, 220);
    };
    timer = window.setInterval(swap, 4500);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearInterval(timer);
      else timer = window.setInterval(swap, 4500);
    });
  }

  const emailEncode = (value) => encodeURIComponent(String(value ?? '').trim());
  const composeMail = (form, subjectPrefix) => {
    const status = form.querySelector('.form-status');
    const destination = form.dataset.mailto;
    const data = new FormData(form);
    const lines = [];
    data.forEach((value, key) => {
      if (key === 'resume') {
        if (value instanceof File && value.name) lines.push(`Resume selected: ${value.name}`);
        return;
      }
      if (String(value).trim()) lines.push(`${key}: ${String(value).trim()}`);
    });
    const subject = `${subjectPrefix} — WEBORA Studio`;
    const bodyText = lines.join('\n');
    if (status) status.textContent = 'Opening your email app… please review the details and press Send.';
    window.location.href = `mailto:${destination}?subject=${emailEncode(subject)}&body=${emailEncode(bodyText)}`;
  };

  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    composeMail(contactForm, 'Project enquiry');
  });

  const careerForm = document.getElementById('careerForm');
  careerForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!careerForm.reportValidity()) return;
    const file = careerForm.querySelector('input[type="file"]')?.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      const status = careerForm.querySelector('.form-status');
      if (status) status.textContent = 'Please keep the resume file at 5 MB or less.';
      return;
    }
    composeMail(careerForm, 'Career application');
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const chatBubble = document.getElementById('chatBubble');
  if (chatBubble && !reduceMotion) {
    window.setTimeout(() => chatBubble.classList.add('show'), 1800);
    window.setTimeout(() => chatBubble.classList.remove('show'), 8500);
  }
});


// Portfolio filtering and resilient preview fallbacks
const portfolioGrid = document.querySelector('.portfolio-project-grid');
if (portfolioGrid) {
  const cards = [...portfolioGrid.querySelectorAll('.project-card')];
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const count = document.getElementById('workCount');
  const empty = document.getElementById('emptyWork');
  const applyFilter = (filter) => {
    let visible = 0;
    cards.forEach(card => {
      const categories = (card.dataset.categories || '').split('|');
      const aliases = filter === 'cafe' ? ['cafe','restaurant','hotel'] : filter === '3d / interactive' ? ['3d / interactive','interactive'] : [filter];
      const match = filter === 'all' || aliases.some(alias => categories.includes(alias));
      card.classList.toggle('is-hidden', !match);
      if (match) visible++;
    });
    if (count) count.textContent = `Showing ${visible} project${visible === 1 ? '' : 's'}`;
    if (empty) empty.hidden = visible !== 0;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    button.classList.add('active'); button.setAttribute('aria-selected','true');
    applyFilter(button.dataset.filter || 'all');
  }));
  portfolioGrid.querySelectorAll('img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.failed) return;
      img.dataset.failed = '1';
      img.src = img.dataset.fallback;
    }, { once: true });
  });
  // Best work is already first in the source; keep that ordering stable.
  applyFilter('all');
}

const previewImages = document.querySelectorAll('img[data-preview]');
if (previewImages.length) {
  const loadPreview = (img) => {
    if (img.dataset.previewLoaded) return;
    img.dataset.previewLoaded = '1';
    const fallback = img.getAttribute('src');
    const preview = img.dataset.preview;
    const probe = new Image();
    probe.onload = () => { img.src = preview; };
    probe.onerror = () => { img.src = fallback; };
    probe.src = preview;
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { loadPreview(entry.target); observer.unobserve(entry.target); }
      });
    }, { rootMargin: '400px 0px' });
    previewImages.forEach(img => io.observe(img));
  } else {
    previewImages.forEach(loadPreview);
  }
}
