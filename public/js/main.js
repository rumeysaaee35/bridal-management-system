
document.addEventListener("DOMContentLoaded", () => {
  const userStr = localStorage.getItem("user");

  const loginIcon = document.getElementById("loginIcon");
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userStr) {
    const user = JSON.parse(userStr);

    if (loginIcon) loginIcon.classList.add("hidden");

    if (userNameEl && user.email) {
      userNameEl.textContent = user.email;
      userNameEl.classList.remove("hidden");
    }
    if (logoutBtn) {
      logoutBtn.classList.remove("hidden");
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.reload();
      });
    }
  } else {
    if (loginIcon) loginIcon.classList.remove("hidden");
    logoutBtn?.classList.add("hidden");
    userNameEl?.classList.add("hidden");
  }
  const fadeItems = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 });

  fadeItems.forEach(el => observer.observe(el));

  document.querySelectorAll("[data-carousel]").forEach(section => {
    const track = section.querySelector(".carousel-track, .featured-list, .similar-track");
    const leftBtn = section.querySelector(".carousel-btn.left");
    const rightBtn = section.querySelector(".carousel-btn.right");

    if (!track) return;

    leftBtn?.addEventListener("click", () => {
      track.scrollBy({ left: -300, behavior: "smooth" });
    });

    rightBtn?.addEventListener("click", () => {
      track.scrollBy({ left: 300, behavior: "smooth" });
    });
  });

});
