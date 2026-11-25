(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMenu();
    setupSmoothScroll();
    setupReveal();
    setupActiveLink();
    setupContactForm();
  });

  function setupMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'فتح قائمة التنقل');
      nav.classList.remove('is-open');
    }

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'فتح قائمة التنقل' : 'إغلاق قائمة التنقل');
      nav.classList.toggle('is-open', !open);
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) close();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    document.addEventListener('click', function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) close();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) close();
    });
  }

  function setupSmoothScroll() {
    document.addEventListener('click', function (event) {
      var link = event.target.closest('a[href^="#"]');
      if (!link) return;

      var hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      var target = document.querySelector(hash);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hash);
      }
    });
  }

  function setupReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (item) { item.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    items.forEach(function (item) { observer.observe(item); });
  }

  function setupActiveLink() {
    var page = window.location.pathname.split('/').pop() || 'index.html';
    if (page !== 'index.html' && page !== '') return;

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[data-section]'));
    if (!links.length) return;

    var sections = links
      .map(function (link) {
        return { link: link, section: document.getElementById(link.dataset.section) };
      })
      .filter(function (item) { return item.section; });

    var ticking = false;

    function update() {
      ticking = false;
      var marker = window.scrollY + Math.min(150, window.innerHeight * 0.25);
      var current = sections[0] && sections[0].link;

      sections.forEach(function (item) {
        if (item.section.offsetTop <= marker) current = item.link;
      });

      links.forEach(function (link) {
        var active = link === current;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  function setupContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var copyButton = document.getElementById('copy-message');
    var composed = '';

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!status || !copyButton) return;

      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var message = form.elements.message.value.trim();
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!name || !validEmail || !message) {
        status.textContent = 'يرجى كتابة الاسم وبريد صحيح والرسالة قبل المتابعة.';
        copyButton.disabled = true;
        composed = '';
        return;
      }

      composed = 'الاسم: ' + name + '\nالبريد الإلكتروني: ' + email + '\n\nالرسالة:\n' + message;
      status.textContent = 'تم تجهيز رسالتك محلياً. يمكنك نسخها الآن؛ لا توجد خدمة إرسال مفعّلة حالياً.';
      copyButton.disabled = false;
    });

    if (!copyButton) return;

    copyButton.addEventListener('click', function () {
      if (!composed || !status) return;

      function fallbackCopy() {
        var area = document.createElement('textarea');
        area.value = composed;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        var copied = false;
        try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
        document.body.removeChild(area);
        status.textContent = copied ? 'تم نسخ الرسالة.' : 'تعذّر النسخ تلقائياً؛ يمكنك تحديد النص ونسخه يدوياً.';
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(composed).then(function () {
          status.textContent = 'تم نسخ الرسالة.';
        }).catch(fallbackCopy);
      } else {
        fallbackCopy();
      }
    });
  }
})();
