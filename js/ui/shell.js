export function initDashboardShell() {
  const body = document.body;
  const sidebar = document.getElementById('shell-sidebar');
  const backdrop = document.getElementById('shell-backdrop');
  const navToggle = document.getElementById('shell-nav-toggle');
  const currentViewLabel = document.getElementById('current-view-label');
  const navButtons = [...document.querySelectorAll('[data-nav-target]')];
  const navLinks = [...document.querySelectorAll('[data-shell-nav][data-nav-target]')];
  const sections = [...new Set(navButtons.map((link) => link.dataset.navTarget))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const sectionById = new Map(sections.map((section) => [section.id, section]));

  function closeSidebar() {
    body.classList.remove('sidebar-open');
  }

  function openSidebar() {
    body.classList.add('sidebar-open');
  }

  function setActiveSection(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.navTarget === id);
    });

    const activeSection = sectionById.get(id) ?? document.getElementById(id);
    if (activeSection && currentViewLabel) {
      currentViewLabel.textContent = activeSection.dataset.sectionLabel ?? activeSection.querySelector('h2, h1')?.textContent ?? 'Astro App';
    }
  }

  function navigateToSection(id) {
    const target = sectionById.get(id) ?? document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
    closeSidebar();
  }

  navToggle?.addEventListener('click', () => {
    if (body.classList.contains('sidebar-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop?.addEventListener('click', closeSidebar);

  navButtons.forEach((link) => {
    link.addEventListener('click', () => {
      navigateToSection(link.dataset.navTarget);
    });
  });

  if ('IntersectionObserver' in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveSection(visible.target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.2, 0.4]
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else if (sections[0]) {
    setActiveSection(sections[0].id);
  }

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) {
      closeSidebar();
    }
  });

  if (sidebar && currentViewLabel && sections[0]) {
    setActiveSection(sections[0].id);
  }
}
