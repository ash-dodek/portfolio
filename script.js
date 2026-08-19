(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lenis = null;

  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      smoothTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  const toggle = document.getElementById('theme-toggle');
  const stored = localStorage.getItem('theme');

  if (stored) root.setAttribute('data-theme', stored);

  toggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  const swatches = document.querySelectorAll('.swatch');
  const storedAccent = localStorage.getItem('accent') || 'gold';

  root.setAttribute('data-accent', storedAccent);
  swatches.forEach((sw) => sw.classList.toggle('active', sw.dataset.accent === storedAccent));

  swatches.forEach((sw) => {
    sw.addEventListener('click', () => {
      const accent = sw.dataset.accent;
      root.setAttribute('data-accent', accent);
      localStorage.setItem('accent', accent);
      swatches.forEach((s) => s.classList.toggle('active', s === sw));
    });
  });

  const navLinks = document.querySelectorAll('.sidenav a');
  const sections = document.querySelectorAll('.section');

  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => spy.observe(section));

  if (lenis) {
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const target = document.getElementById(link.dataset.section);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.3, offset: -20 });
      });
    });
  }

  const revealTargets = document.querySelectorAll('.reveal');
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  revealTargets.forEach((el) => revealer.observe(el));
})();
