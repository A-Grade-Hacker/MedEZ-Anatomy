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

// Ripple micro-interaction
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return;

  document.querySelectorAll("[data-ripple]").forEach(btn => {
    btn.style.position = "relative";
    btn.style.overflow = "hidden";

    btn.addEventListener("pointerdown", function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement("span");
      const size = Math.max(rect.width, rect.height) * 1.6;

      circle.className = "ripple";
      circle.style.width = circle.style.height = size + "px";
      circle.style.left = e.clientX - rect.left - size / 2 + "px";
      circle.style.top = e.clientY - rect.top - size / 2 + "px";

      this.appendChild(circle);
      setTimeout(() => circle.remove(), 650);
    });
  });
})();
// QUIZ PAGE POPUP FEATURE
document.addEventListener("DOMContentLoaded", () => {
  const isQuizPage = window.location.pathname.includes("quizzes.html");

  if (isQuizPage) {
    document.body.classList.add("quiz-active");
  }
});
