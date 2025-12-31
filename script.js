// Automatic active link detection
document.addEventListener("DOMContentLoaded", () => {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
    }
  });
});

// Premium header scroll effect
let lastScroll = 0;
const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  lastScroll = currentScroll;
});

// Enhanced ripple micro-interaction
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  document.querySelectorAll("[data-ripple]").forEach(btn => {
    btn.style.position = "relative";
    btn.style.overflow = "hidden";

    btn.addEventListener("pointerdown", function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 2;

      circle.className = "ripple";
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = e.clientX - rect.left - size / 2 + "px";
      circle.style.top = e.clientY - rect.top - size / 2 + "px";

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });
})();

// Scroll-triggered animations for objective sections
const observerOptions = {
  threshold: 0.15,
  rootMargin: "0px 0px -100px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
  const objectives = document.querySelectorAll(".objective-inner");
  objectives.forEach(obj => observer.observe(obj));
});

// Advanced card tilt effect (3D hover)
const cards = document.querySelectorAll(".card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  cards.forEach(card => {
    card.addEventListener("mousemove", function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener("mouseleave", function() {
      this.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
}

// Smooth parallax effect for hero visual
if (!prefersReducedMotion) {
  const heroVisual = document.querySelector(".hero-visual .visual-card");

  if (heroVisual) {
    window.addEventListener("scroll", () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * 0.3;

      if (scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${rate}px)`;
      }
    });
  }
}

// QUIZ PAGE POPUP FEATURE
document.addEventListener("DOMContentLoaded", () => {
  const isQuizPage = window.location.pathname.includes("quizzes.html");

  if (isQuizPage) {
    document.body.classList.add("quiz-active");
  }
});

// 3D MODEL PAGE: Toggle and fade effect
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const modelFrame = document.getElementById("modelFrame");
  const modelEmbed = document.querySelector(".model-embed");
  const resetBtn = document.getElementById("resetViewBtn");

  const models = {
    male: "https://sketchfab.com/models/7w7pAfr2F/embed",
    female: "https://sketchfab.com/models/c20b1d16c10f4f0799d2b909e8a1a64a/embed"
  };

  if (toggleBtns.length > 0 && modelFrame) {
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", function() {
        const selectedModel = this.getAttribute("data-model");

        toggleBtns.forEach(b => b.classList.remove("active"));
        this.classList.add("active");

        modelEmbed.classList.add("fade");

        setTimeout(() => {
          modelFrame.src = models[selectedModel];
          modelEmbed.classList.remove("fade");
        }, 250);
      });
    });
  }

  if (resetBtn && modelFrame) {
    resetBtn.addEventListener("click", () => {
      const currentSrc = modelFrame.src;
      modelEmbed.classList.add("fade");

      setTimeout(() => {
        modelFrame.src = currentSrc;
        modelEmbed.classList.remove("fade");
      }, 250);
    });
  }
});

// Enhanced form animations
const formInputs = document.querySelectorAll("input, textarea");

formInputs.forEach(input => {
  input.addEventListener("focus", function() {
    this.parentElement.style.transform = "translateX(2px)";
  });

  input.addEventListener("blur", function() {
    this.parentElement.style.transform = "translateX(0)";
  });
});

// Animated number counter (if you want to add stats later)
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// Staggered animation for lists
const listItems = document.querySelectorAll(".card ul li");
if (listItems.length > 0 && !prefersReducedMotion) {
  listItems.forEach((item, index) => {
    item.style.opacity = "0";
    item.style.transform = "translateX(-20px)";
    item.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)";

    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateX(0)";
    }, index * 100);
  });
}

// Magnetic button effect for primary CTA
const primaryBtns = document.querySelectorAll(".btn-primary");

if (!prefersReducedMotion) {
  primaryBtns.forEach(btn => {
    btn.addEventListener("mousemove", function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) translateY(-3px)`;
    });

    btn.addEventListener("mouseleave", function() {
      this.style.transform = "translate(0, 0)";
    });
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// Add loading state for better UX
window.addEventListener("load", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 0.3s ease";
    document.body.style.opacity = "1";
  }, 50);
});

// Performance optimization: debounce scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Logo pulse animation on hover
const logo = document.querySelector(".logo");
if (logo && !prefersReducedMotion) {
  logo.addEventListener("mouseenter", function() {
    const logoBox = this.querySelector(".logo-box");
    logoBox.style.animation = "none";
    setTimeout(() => {
      logoBox.style.animation = "pulse-button 0.6s ease-out";
    }, 10);
  });
}
