/**
 * script.js — corrected and robust
 *
 * - Contact form handling (client-side feedback)
 * - 3D model selection (iframe loader)
 * - Coming Soon modal behavior:
 *    - Hero Test button (class js-trigger-test) -> OK only (dismiss)
 *    - Nav Quizzes link (class js-trigger-quizzes) -> Go Home only (redirect)
 *    - Quizzes page: heavy blur while modal open; non-admin sees Go Home; admin sees OK
 * - Admin access: Ctrl+Shift+A prompt or window.__setAdmin(password)
 *
 * Load with: <script defer src="script.js"></script>
 */

(function () {
  const ADMIN_PASSWORD = 'medez-admin'; // change to your secure admin password

  // Admin helpers
  function isAdmin() {
    return localStorage.getItem('medez_isAdmin') === 'true';
  }
  function setAdmin(flag) {
    localStorage.setItem('medez_isAdmin', flag ? 'true' : 'false');
  }
  window.__setAdmin = function (password) {
    if (String(password) === ADMIN_PASSWORD) {
      setAdmin(true);
      return true;
    }
    return false;
  };

  // Admin login prompt (Ctrl+Shift+A)
  function promptAdminLogin() {
    const attempt = prompt('Admin access required. Enter admin password:');
    if (attempt === null) return;
    if (String(attempt) === ADMIN_PASSWORD) {
      setAdmin(true);
      alert('Admin access granted.');
    } else {
      alert('Incorrect password.');
    }
  }
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      promptAdminLogin();
    }
  });

  // Utility: normalize href and check quizzes link
  function isQuizzesHref(href) {
    if (!href) return false;
    try {
      const clean = href.split('?')[0].split('#')[0].replace(/^\.\//, '').replace(/^\//, '').toLowerCase();
      return clean === 'quizzes.html' || clean === 'quizzes';
    } catch {
      return false;
    }
  }

  // DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    /* Contact form handling */
    const contactForm = document.getElementById('contact-form');
    const contactResponse = document.getElementById('contact-response');

    if (contactForm && contactResponse) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contactForm.name.value.trim();
        const email = contactForm.email.value.trim();
        const message = contactForm.message.value.trim();

        if (!name || !email || !message) {
          contactResponse.textContent = 'Please fill in all fields before submitting.';
          contactResponse.classList.remove('success');
          contactResponse.classList.add('error');
          return;
        }

        contactResponse.textContent = 'Thank you for your message. We will review it shortly.';
        contactResponse.classList.remove('error');
        contactResponse.classList.add('success');
        contactForm.reset();
      });
    }

    /* 3D model selection (if present) */
    const frame = document.getElementById('biodigital-frame');
    const placeholder = document.getElementById('model-placeholder');

    document.querySelectorAll('.model-card').forEach(button => {
      button.addEventListener('click', () => {
        const model = button.dataset.model;
        if (!frame) return;
        let src = '';
        if (model === 'male') src = 'https://your-male-model-embed-url.example.com';
        else if (model === 'female') src = 'https://your-female-model-embed-url.example.com';
        if (src) {
          frame.src = src;
          frame.classList.add('visible');
          if (placeholder) placeholder.classList.add('hidden');
        }
      });
    });

    /* Coming Soon modal */
    const modal = document.getElementById('coming-soon-modal');
    if (!modal) return;

    const okBtn = document.getElementById('cs-ok');
    const homeBtn = document.getElementById('cs-home');

    // pendingNavigation: { href } when admin clicked quizzes link from index
    let pendingNavigation = null;

    // Determine if current page is quizzes.html
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const onQuizzesPage = currentPage === 'quizzes.html' || currentPage === 'quizzes';

    function openModalForTrigger(options = {}) {
      // options: { href, triggerType } where triggerType can be 'test' or 'nav'
      const userIsAdmin = isAdmin();
      pendingNavigation = null;

      // Decide which buttons to show
      // Priority: explicit triggerType, then href detection, then page context
      const triggerType = options.triggerType || (options.href && isQuizzesHref(options.href) ? 'nav' : 'test');

      if (onQuizzesPage) {
        if (userIsAdmin) {
          showButtons({ ok: true, home: false });
          pendingNavigation = { allowView: true };
        } else {
          showButtons({ ok: false, home: true });
          pendingNavigation = { goHome: true };
        }
      } else {
        // Not on quizzes page
        if (triggerType === 'nav') {
          if (userIsAdmin) {
            showButtons({ ok: true, home: false });
            pendingNavigation = { href: options.href || 'quizzes.html' };
          } else {
            // Non-admin clicking nav from index: show OK only (dismiss)
            showButtons({ ok: true, home: false });
            pendingNavigation = null;
          }
        } else {
          // test trigger: OK only, dismiss
          showButtons({ ok: true, home: false });
          pendingNavigation = null;
        }
      }

      // Apply heavy blur if modal opened while on quizzes page
      if (onQuizzesPage) document.documentElement.classList.add('heavy-blur');

      // Show modal
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');

      // Focus panel for accessibility
      const panel = modal.querySelector('.cs-panel') || modal;
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // Block Escape and absorb clicks (modal not dismissible by backdrop/Escape)
      document.addEventListener('keydown', blockEscape, true);
      modal.addEventListener('click', absorbClicks, true);
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.documentElement.classList.remove('heavy-blur');
      document.removeEventListener('keydown', blockEscape, true);
      modal.removeEventListener('click', absorbClicks, true);
      pendingNavigation = null;
    }

    function blockEscape(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        e.preventDefault();
      }
    }

    function absorbClicks(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    function showButtons({ ok, home }) {
      if (okBtn) okBtn.style.display = ok ? 'inline-flex' : 'none';
      if (homeBtn) homeBtn.style.display = home ? 'inline-flex' : 'none';
    }

    // Attach handlers to triggers
    function attachTriggerHandlers() {
      // explicit test trigger (hero)
      document.querySelectorAll('.js-trigger-test').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.preventDefault();
          const href = el.getAttribute('href') || null;
          openModalForTrigger({ href, triggerType: 'test' });
        });
      });

      // explicit quizzes nav trigger
      document.querySelectorAll('.js-trigger-quizzes').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.preventDefault();
          const href = el.getAttribute('href') || 'quizzes.html';
          openModalForTrigger({ href, triggerType: 'nav' });
        });
      });

      // fallback: any anchor linking to quizzes.html (if classes not present)
      document.querySelectorAll('a[href]').forEach(a => {
        try {
          const href = a.getAttribute('href') || '';
          if (isQuizzesHref(href)) {
            // avoid double-binding if class already used
            if (a.classList.contains('js-trigger-quizzes')) return;
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              openModalForTrigger({ href, triggerType: 'nav' });
            });
          }
        } catch (err) {
          // ignore malformed hrefs
        }
      });
    }

    // OK button behavior
    if (okBtn) {
      okBtn.addEventListener('click', () => {
        if (pendingNavigation && pendingNavigation.href) {
          // admin allowed to navigate to quizzes
          closeModal();
          setTimeout(() => {
            window.location.href = pendingNavigation.href;
          }, 120);
          return;
        }

        // admin on quizzes page: allow viewing (close)
        if (pendingNavigation && pendingNavigation.allowView) {
          closeModal();
          return;
        }

        // default: close modal (hero OK)
        closeModal();
      });
    }

    // Go Home button behavior
    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        closeModal();
        window.location.href = 'index.html';
      });
    }

    attachTriggerHandlers();
  });
})();
