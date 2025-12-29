/* =================================================
   MAIN.JS
   - Login içermez
   - API çağırmaz
   - Sadece genel site davranışları
================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =====================
     HEADER USER DURUMU
  ===================== */
  const userStr = localStorage.getItem("user");

  const loginIcon = document.getElementById("loginIcon");
  const userNameEl = document.getElementById("userName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (userStr) {
    const user = JSON.parse(userStr);

    // login ikonunu gizle
    if (loginIcon) loginIcon.classList.add("hidden");

    // kullanıcı adı varsa göster
    if (userNameEl && user.email) {
      userNameEl.textContent = user.email;
      userNameEl.classList.remove("hidden");
    }

    // logout butonu
    if (logoutBtn) {
      logoutBtn.classList.remove("hidden");
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.reload();
      });
    }
  } else {
    // giriş yoksa
    if (loginIcon) loginIcon.classList.remove("hidden");
    logoutBtn?.classList.add("hidden");
    userNameEl?.classList.add("hidden");
  }

  /* =====================
     FADE-UP ANIMATION
  ===================== */
  const fadeItems = document.querySelectorAll(".fade-up");
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  }, { threshold: 0.2 });

  fadeItems.forEach(el => observer.observe(el));

  /* =====================
     CAROUSEL BUTONLARI
  ===================== */
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
