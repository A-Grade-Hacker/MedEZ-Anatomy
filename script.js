/**
 * merged script.js
 * - Contact form handling (simple client-side feedback)
 * - Trivia interactions (feedback + confetti)
 * - Draggable helper
 * - 3D model selection (iframe loader)
 * - Placeholder quiz handler
 * - Permanent "Coming Soon" modal (non-dismissible) that opens for .js-coming-soon and quizzes.html links
 *
 * Load this file with <script defer src="script.js"></script>
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ============================
     Contact form handling
     ============================ */
  const contactForm = document.getElementById('contact-form');
  const contactResponse = document.getElementById('contact-response');

  if (contactForm && contactResponse) {
    contactForm.addEventListener('submit', e => {
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
     Trivia interaction
     ============================ */
  document.querySelectorAll('.trivia-card').forEach(card => {
    const feedback = card.querySelector('.feedback');
    const buttons = card.querySelectorAll('.choices button');

    buttons.forEach(button => {
      button.addEventListener('click', () => {
        if (!feedback) return;
        if (button.dataset.correct === 'true') {
          feedback.textContent = 'Correct.';
          feedback.classList.remove('error');
          feedback.classList.add('success');
          launchConfetti();
        } else {
          feedback.textContent = 'Not quite. Try another option.';
          feedback.classList.remove('success');
          feedback.classList.add('error');
        }
      });
    });
  });

  /* ============================
     Draggable behavior
     ============================ */
  document.querySelectorAll('[data-draggable="true"]').forEach(el => {
    makeDraggable(el);
  });

  /* ============================
     Quiz system selection (placeholder)
     ============================ */
  document.querySelectorAll('.system-card').forEach(card => {
    card.addEventListener('click', () => {
      // The permanent coming-soon modal will intercept navigation if configured.
      // Keep this placeholder for potential future behavior.
      const system = card.dataset.system;
      openQuiz(system);
    });
  });

  /* ============================
     3D model selection
     ============================ */
  const frame = document.getElementById('biodigital-frame');
  const placeholder = document.getElementById('model-placeholder');

  document.querySelectorAll('.model-card').forEach(button => {
    button.addEventListener('click', () => {
      const model = button.dataset.model;
      if (!frame) return;

      // Replace with your actual embed URLs
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
     Permanent Coming Soon modal handlers
     - Non-dismissible by user (no close button, backdrop clicks and Escape ignored)
     - Opens for elements with .js-coming-soon and anchors linking to quizzes.html
     ============================ */
  (function initPermanentComingSoon() {
    const modal = document.getElementById('coming-soon-modal');
    if (!modal) return;

    // Open modal and lock page
    function openModalPermanent() {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');

      // Focus the panel for accessibility
      const panel = modal.querySelector('.cs-panel') || modal.querySelector('.cs-panel, .cs-body, .cs-header');
      if (panel) {
        panel.setAttribute('tabindex', '-1');
        panel.focus();
      }

      // Block Escape key and absorb clicks while modal is open
      document.addEventListener('keydown', blockEscape, true);
      modal.addEventListener('click', absorbClicks, true);
    }

    // No-op for Escape key while modal is open
    function blockEscape(e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        e.preventDefault();
      }
    }

    // Absorb clicks so they don't propagate to page
    function absorbClicks(e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Attach handlers to triggers
    function attachHandlers() {
      // 1) explicit triggers: elements with class js-coming-soon
      document.querySelectorAll('.js-coming-soon').forEach(el => {
        el.addEventListener('click', (ev) => {
          ev.preventDefault();
          openModalPermanent();
        });
      });

      // 2) fallback: any anchor linking to quizzes.html (covers nav links)
      document.querySelectorAll('a[href]').forEach(a => {
        try {
          const href = a.getAttribute('href') || '';
          if (href.replace(/^\.\//, '').toLowerCase().endsWith('quizzes.html')) {
            a.addEventListener('click', (ev) => {
              ev.preventDefault();
              openModalPermanent();
            });
          }
        } catch (e) {
          // ignore malformed hrefs
        }
      });
    }

    // Initialize
    attachHandlers();

    // Developer/admin programmatic close (optional). Remove if you want absolutely no override.
    // To close during testing: run window.__comingSoonAdminClose() in the console.
    window.__comingSoonAdminClose = function () {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', blockEscape, true);
      modal.removeEventListener('click', absorbClicks, true);
    };
  })();
});

/* ============================
   Utility: makeDraggable
   ============================ */
function makeDraggable(el) {
  let startX = 0;
  let startY = 0;
  let originX = 0;
  let originY = 0;
  let dragging = false;

  // Ensure element has positioning context
  const computed = window.getComputedStyle(el);
  if (computed.position === 'static') {
    el.style.position = 'relative';
  }

  const onMouseDown = e => {
    // Only left mouse button
    if (e.button !== 0) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;

    // If transform exists, try to parse current translate values
    const transform = el.style.transform;
    if (transform && transform.startsWith('translate(')) {
      const match = transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
      if (match) {
        originX = parseFloat(match[1]);
        originY = parseFloat(match[2]);
      } else {
        originX = 0;
        originY = 0;
      }
    } else {
      originX = 0;
      originY = 0;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    el.classList.add('dragging');
  };

  const onMouseMove = e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    el.style.transform = `translate(${originX + dx}px, ${originY + dy}px)`;
  };

  const onMouseUp = () => {
    if (!dragging) return;
    dragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    el.classList.remove('dragging');
  };

  el.addEventListener('mousedown', onMouseDown);

  // Touch support
  el.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    originX = 0;
    originY = 0;
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
    el.classList.add('dragging');
  }, { passive: true });

  function onTouchMove(e) {
    e.preventDefault();
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    el.style.transform = `translate(${originX + dx}px, ${originY + dy}px)`;
  }

  function onTouchEnd() {
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
    el.classList.remove('dragging');
  }
}

/* ============================
   Utility: Confetti (simple)
   ============================ */
function launchConfetti() {
  const container = document.createElement('div');
  container.classList.add('confetti-container');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  container.style.zIndex = '9999';
  document.body.appendChild(container);

  const numPieces = 35;
  const colors = ['#1e6fd9', '#4a8fe0', '#7bb4f2', '#a8d1ff'];

  for (let i = 0; i < numPieces; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    const size = Math.floor(Math.random() * 10) + 6;
    piece.style.position = 'absolute';
    piece.style.width = `${size}px`;
    piece.style.height = `${size * 0.6}px`;
    piece.style.left = Math.random() * 100 + '%';
    piece.style.top = '-10%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.opacity = String(0.9 - Math.random() * 0.4);
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.borderRadius = '2px';
    piece.style.willChange = 'transform, top';
    container.appendChild(piece);

    // Animate
    const duration = 1800 + Math.random() * 1200;
    const endX = (Math.random() - 0.5) * 200; // horizontal drift
    const endY = window.innerHeight + 200 + Math.random() * 300;
    piece.animate([
      { transform: `translate3d(0, 0, 0) rotate(${Math.random() * 360}deg)`, top: '-10%' },
      { transform: `translate3d(${endX}px, ${endY}px, 0) rotate(${Math.random() * 720}deg)`, top: `${endY}px` }
    ], {
      duration,
      easing: 'cubic-bezier(.2,.7,.2,1)'
    });
  }

  setTimeout(() => {
    container.remove();
  }, 3500);
}

/* ============================
   Placeholder quiz handler
   ============================ */
function openQuiz(systemName) {
  // Placeholder behavior: the permanent coming-soon modal will typically intercept clicks.
  // Keep this simple for future extension.
  console.info('openQuiz called for:', systemName);
}
