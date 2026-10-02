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

  // Picks the last section whose top has crossed the trigger line, instead of
  // watching a thin intersection band — short sections (Education, About)
  // can't get skipped over between scroll frames this way.
  let spyTicking = false;
  const updateActiveSection = () => {
    spyTicking = false;
    updateProgress();
    let currentId = sections[0].id;
    if ((lenis ? lenis.scroll : window.scrollY) > 4) {
      const triggerLine = Math.min(window.innerHeight * 0.4, 180);
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top - triggerLine <= 0) {
          currentId = section.id;
        }
      });
    }
    // The last section is too short to reach the trigger line, so once the
    // page bottoms out it wins regardless.
    const y = lenis ? lenis.scroll : window.scrollY;
    if (y >= document.documentElement.scrollHeight - window.innerHeight - 4) {
      currentId = sections[sections.length - 1].id;
    }
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.section === currentId);
    });
  };
  const progress = document.querySelector('.scroll-progress');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = lenis ? lenis.scroll : window.scrollY;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
  };

  const requestSpyUpdate = () => {
    if (spyTicking) return;
    spyTicking = true;
    requestAnimationFrame(updateActiveSection);
  };

  window.addEventListener('scroll', requestSpyUpdate, { passive: true });
  window.addEventListener('resize', requestSpyUpdate);
  if (lenis) lenis.on('scroll', requestSpyUpdate);
  updateActiveSection();

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

  // Stagger groups: each child gets an index for its entry delay. Once the
  // group has played in, "settled" drops the delay so hovers stay instant.
  document.querySelectorAll('.chips, .tags').forEach((group) => {
    group.classList.add('stagger');
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', i));
  });

  const revealTargets = document.querySelectorAll('.reveal');
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        setTimeout(() => {
          entry.target.querySelectorAll('.stagger').forEach((g) => g.classList.add('settled'));
        }, 1600);
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  revealTargets.forEach((el) => revealer.observe(el));

  // Cursor spotlight on project cards (pointer events only, no scroll work).
  document.querySelectorAll('.project').forEach((card) => {
    const core = card.querySelector('.project-core');
    card.addEventListener('pointermove', (e) => {
      const r = core.getBoundingClientRect();
      core.style.setProperty('--mx', `${e.clientX - r.left}px`);
      core.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
})();
