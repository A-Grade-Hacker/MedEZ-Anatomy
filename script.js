document.addEventListener('DOMContentLoaded', () => {
  // Contact form handling
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

  // Trivia interaction (if any remain)
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

  // Draggable behavior (if used elsewhere)
  document.querySelectorAll('[data-draggable="true"]').forEach(el => {
    makeDraggable(el);
  });

  // 3D model selection
  const frame = document.getElementById('biodigital-frame');
  const placeholder = document.getElementById('model-placeholder');

  document.querySelectorAll('.model-card').forEach(button => {
    button.addEventListener('click', () => {
      const model = button.dataset.model;
      if (!frame) return;

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

  // Quizzes: show "Coming Soon" modal
  const modal = document.getElementById('coming-soon-modal');
  const modalOk = document.getElementById('modal-ok');

  function openComingSoon() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    // trap focus on modal
    const focusable = modal.querySelectorAll('button, [href], input, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
    document.addEventListener('keydown', onKeyDown);
  }

  function closeComingSoon() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') closeComingSoon();
  }

  // Attach to system cards
  document.querySelectorAll('.system-card').forEach(card => {
    card.addEventListener('click', () => {
      openComingSoon();
    });
  });

  // Modal close handlers
  modal?.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.dataset && target.dataset.close === 'true') {
      closeComingSoon();
    }
  });

  modalOk?.addEventListener('click', () => {
    closeComingSoon();
  });
});

// Simple drag behavior
function makeDraggable(el) {
  let startX = 0;
  let startY = 0;

  el.style.position = 'relative';

  const onMouseDown = e => {
    startX = e.clientX;
    startY = e.clientY;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = e => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  el.addEventListener('mousedown', onMouseDown);
}

// Confetti animation
function launchConfetti() {
  const container = document.createElement('div');
  container.classList.add('confetti-container');
  document.body.appendChild(container);

  const numPieces = 35;
  const colors = ['#1e6fd9', '#4a8fe0', '#7bb4f2', '#a8d1ff'];

  for (let i = 0; i < numPieces; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 2500);
}
