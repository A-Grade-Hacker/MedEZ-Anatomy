/**
 * script.js (merged & cleaned)
 *
 * - Contact form handling (client-side feedback)
 * - 3D model selection (iframe loader)
 * - Permanent "Coming Soon" modal (non-dismissible by backdrop/Escape)
 *   - OK button closes modal and returns user to the page
 *   - Go Home button redirects to index.html
 *
 * Load with: <script defer src="script.js"></script>
 */

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
     Permanent Coming Soon modal (non-dismissible by backdrop/Escape)
     - OK closes modal (reveals page)
     - Go Home redirects to index.html
     - Opens for .js-coming-soon and anchors linking to quizzes.html
     ============================ */
  (function initPermanentComingSoon() {
    const modal = document.getElementById('coming-soon-modal');
    if (!modal) return;

    const okBtn = document.getElementById('cs-ok');
    const homeBtn = document.getElementById('cs-home');

    function openModalPermanent() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');

      // Focus the panel for accessibility
      const panel = modal.querySelector('.cs-panel') || modal;
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // Block Escape key and absorb clicks while modal is open
      document.addEventListener('keydown', blockEscape, true);
      modal.addEventListener('click', absorbClicks, true);
    }

    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', blockEscape, true);
      modal.removeEventListener('click', absorbClicks, true);
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

    // Attach handlers to triggers
    function attachHandlers() {
      // explicit triggers
      document.querySelectorAll('.js-coming-soon').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.preventDefault();
          openModalPermanent();
        });
      });

      // fallback: anchors linking to quizzes.html
      document.querySelectorAll('a[href]').forEach(a => {
        try {
          const href = a.getAttribute('href') || '';
          if (href.replace(/^\.\//, '').toLowerCase().endsWith('quizzes.html')) {
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              openModalPermanent();
            });
          }
        } catch (err) {
          // ignore malformed hrefs
        }
      });
    }

    // OK button: close modal and return to page (useful on index)
    okBtn && okBtn.addEventListener('click', () => {
      closeModal();
    });

    // Go Home button: redirect to index.html
    homeBtn && homeBtn.addEventListener('click', () => {
      // Close modal first to avoid visual flash on some browsers
      closeModal();
      // Redirect to home
      window.location.href = 'index.html';
    });

    attachHandlers();

    // Developer/admin programmatic close (optional). Remove if you want absolutely no override.
    // To close during testing: run window.__comingSoonAdminClose() in the console.
    window.__comingSoonAdminClose = function () {
      closeModal();
    };
  })();

  /* ============================
     Minimal placeholder for future quiz behavior
     ============================ */
  function openQuiz(systemName) {
    // Intentionally minimal: the permanent modal will typically intercept clicks.
    // Keep this for future extension.
    console.info('openQuiz called for:', systemName);
  }

  // Attach placeholder quiz handler to system cards (keeps behavior consistent)
  document.querySelectorAll('.system-card').forEach(card => {
    card.addEventListener('click', () => {
      const system = card.dataset.system;
      openQuiz(system);
    });
  });
});
