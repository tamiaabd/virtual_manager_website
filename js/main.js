/* =============================================
   VIRTUAL MANAGER — MAIN JAVASCRIPT
   ============================================= */

(function () {
  'use strict';

  /* ---- rAF-throttled scroll runner ---- */
  let scrollTicking = false;
  const scrollHandlers = [];

  function onScroll() {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        scrollHandlers.forEach(function (fn) { fn(); });
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Navbar: Sticky shadow on scroll ---- */
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  scrollHandlers.push(handleNavbarScroll);
  handleNavbarScroll();

  /* ---- Navbar: Hamburger / mobile menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  function closeMenu() {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Toggle menu');
    document.body.style.overflow = '';
  }

  function openMenu() {
    navMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function () {
      if (navMenu.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navMenu.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMenu();
        hamburger.focus();
      }
    });
  }

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id], main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 100;

    let current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  scrollHandlers.push(updateActiveNavLink);
  updateActiveNavLink();

  /* ---- YouTube click-to-load facade ---- */
  const videoFacade = document.getElementById('videoFacade');
  if (videoFacade) {
    videoFacade.addEventListener('click', function () {
      const id = videoFacade.getAttribute('data-video-id');
      const iframe = document.createElement('iframe');
      iframe.className = 'video__iframe';
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = 'Virtual Manager - App Overview';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.setAttribute('loading', 'lazy');
      videoFacade.replaceWith(iframe);
    });
  }

  /* ---- FAQ Accordion ---- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(function (item) {
    const question = item.querySelector('.faq-item__question');
    const answer = item.querySelector('.faq-item__answer');

    if (!question || !answer) return;

    question.addEventListener('click', function () {
      const isExpanded = question.getAttribute('aria-expanded') === 'true';

      faqItems.forEach(function (otherItem) {
        const otherQ = otherItem.querySelector('.faq-item__question');
        const otherA = otherItem.querySelector('.faq-item__answer');
        if (otherQ && otherA && otherItem !== item) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.style.maxHeight = '0px';
        }
      });

      const newState = !isExpanded;
      question.setAttribute('aria-expanded', String(newState));
      answer.style.maxHeight = newState ? answer.scrollHeight + 'px' : '0px';
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });

  /* ---- Screenshot scroll: drag to scroll ---- */
  const scrollWrapper = document.querySelector('.screenshots__scroll-wrapper');

  if (scrollWrapper) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    scrollWrapper.addEventListener('mousedown', function (e) {
      isDown = true;
      scrollWrapper.style.cursor = 'grabbing';
      startX = e.pageX - scrollWrapper.offsetLeft;
      scrollLeft = scrollWrapper.scrollLeft;
    });

    scrollWrapper.addEventListener('mouseleave', function () {
      isDown = false;
      scrollWrapper.style.cursor = 'grab';
    });

    scrollWrapper.addEventListener('mouseup', function () {
      isDown = false;
      scrollWrapper.style.cursor = 'grab';
    });

    scrollWrapper.addEventListener('mousemove', function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollWrapper.scrollLeft = scrollLeft - walk;
    });
  }

  /* ---- Intersection Observer: fade-in on scroll ---- */
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    };

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll(
      '.feature-card, .benefit-item, .about__badge, .screenshot-frame, .download__feature'
    ).forEach(function (el) {
      el.classList.add('animate-on-scroll');
      observer.observe(el);
    });
  }

})();
