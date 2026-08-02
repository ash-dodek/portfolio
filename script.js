(function () {
  const root = document.documentElement;
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
})();
