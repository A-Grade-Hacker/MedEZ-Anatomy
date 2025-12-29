/**
 * script.js (merged)
 *
 * - Contact form handling (client-side feedback)
 * - 3D model selection (iframe loader)
 * - Coming Soon modal behavior:
 *    - Home page: OK only (dismisses modal)
 *    - Quizzes page: Go Home only (redirects to index.html) unless admin
 *    - Background heavy blur on quizzes page while modal open
 * - Admin access: Ctrl+Shift+A opens admin login prompt; also callable via window.__setAdmin(password)
 *
 * Load with: <script defer src="script.js"></script>
 */

(function () {
  const ADMIN_PASSWORD = 'medez-admin'; // change this to your preferred admin password

  // Utility: check if current page is quizzes.html (normalize)
  function isQuizzesPage() {
    const path = window.location.pathname.split('/').pop().toLowerCase();
    return path === 'quizzes.html' || path === 'quizzes' || path === '';
  }

  // Admin helpers
  function isAdmin() {
    return localStorage.getItem('medez_isAdmin') === 'true';
  }

  function setAdmin(flag) {
    localStorage.setItem('medez_isAdmin', flag ? 'true' : 'false');
  }

  // Expose console helper to set admin programmatically
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
    if (attempt === null) return; // cancelled
    if (String(attempt) === ADMIN_PASSWORD) {
      setAdmin(true);
      alert('Admin access granted.');
    } else {
      alert('Incorrect password.');
    }
  }

  // Attach keyboard shortcut for admin login
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      promptAdminLogin();
    }
  });

  // DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    /* ============================
       Contact form handling
       ============================ */
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

    /* ============================
       3D model selection
       ============================ */
    const frame = document.getElementById('biodigital-frame');
    const placeholder = document.getElementById('model-placeholder');

    document.querySelectorAll('.model-card').forEach(button => {
      button.addEventListener('click', () => {
        const model = button.dataset.model;
        if (!frame) return;

        // Replace these with your actual embed URLs
        let src = '';
        if (model === 'male') {
          src = 'https://your-male-model-embed-url.example.com';
        } else if (model === 'female') {
          src = 'https://your-female-model-embed-url.example.com';
        }

        if (src) {
          frame.src = src;
          frame.classList.add('visible');
          if (placeholder) placeholder.classList.add('hidden');
        }
      });
    });

    /* ============================
       Coming Soon modal behavior
       ============================ */
    const modal = document.getElementById('coming-soon-modal');
    if (!modal) return;

    const okBtn = document.getElementById('cs-ok');
    const homeBtn = document.getElementById('cs-home');

    // Track the trigger origin so we can navigate if needed
    let pendingNavigation = null; // { href: 'quizzes.html' } or null

    function openModalForTrigger(href) {
      // Determine context: home vs quizzes
      const onQuizzesPage = window.location.pathname.split('/').pop().toLowerCase() === 'quizzes.html';
      const userIsAdmin = isAdmin();

      // Show/hide buttons based on context and admin status
      if (onQuizzesPage) {
        // On quizzes page: if admin -> show OK (allow viewing), else show Go Home
        if (userIsAdmin) {
          okBtn.style.display = 'inline-flex';
          homeBtn.style.display = 'none';
          pendingNavigation = { allowView: true }; // admin allowed to view
        } else {
          okBtn.style.display = 'none';
          homeBtn.style.display = 'inline-flex';
          pendingNavigation = { goHome: true };
        }
      } else {
        // Not on quizzes page (e.g., index): show OK only
        okBtn.style.display = 'inline-flex';
        homeBtn.style.display = 'none';
        // If the trigger was a link to quizzes, store that intent so admin OK can navigate
        if (href && href.replace(/^\.\//, '').toLowerCase().endsWith('quizzes.html')) {
          pendingNavigation = { href: href };
        } else {
          pendingNavigation = null;
        }
      }

      // Apply heavy blur if modal opened from quizzes page (background more blurred)
      if (window.location.pathname.split('/').pop().toLowerCase() === 'quizzes.html') {
        document.documentElement.classList.add('heavy-blur');
      }

      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');

      // Focus panel for accessibility
      const panel = modal.querySelector('.cs-panel') || modal;
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // Block Escape and absorb clicks (modal is not dismissible by backdrop/Escape)
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

    // Attach click handlers to triggers:
    // - explicit: elements with .js-coming-soon
    // - fallback: anchors linking to quizzes.html
    function attachTriggerHandlers() {
      document.querySelectorAll('.js-coming-soon').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.preventDefault();
          const href = el.getAttribute('href') || null;
          openModalForTrigger(href);
        });
      });

      document.querySelectorAll('a[href]').forEach(a => {
        try {
          const href = a.getAttribute('href') || '';
          if (href.replace(/^\.\//, '').toLowerCase().endsWith('quizzes.html')) {
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              openModalForTrigger(href);
            });
          }
        } catch (err) {
          // ignore malformed hrefs
        }
      });
    }

    // OK button behavior:
    // - If pendingNavigation.href exists and user is admin, navigate to that href
    // - Otherwise simply close modal
    okBtn.addEventListener('click', () => {
      if (pendingNavigation && pendingNavigation.href) {
        // If admin allowed, navigate to quizzes page
        // Close modal first for smoother transition
        closeModal();
        window.location.href = pendingNavigation.href;
        return;
      }

      // If on quizzes page and admin clicked OK, simply close modal and allow viewing
      if (pendingNavigation && pendingNavigation.allowView) {
        closeModal();
        return;
      }

      // Default: close modal
      closeModal();
    });

    // Go Home button behavior: redirect to index.html
    homeBtn.addEventListener('click', () => {
      closeModal();
      window.location.href = 'index.html';
    });

    attachTriggerHandlers();
  });
})();
