document.addEventListener("DOMContentLoaded", () => {
  loadShopProducts();
});

async function loadShopProducts() {
  try {
    const res = await fetch("http://localhost:8081/urunler");
    const urunler = await res.json();

    const container = document.getElementById("urunListesi");
    container.innerHTML = "";

    for (const u of urunler) {
      let foto = "img/no-image.jpg";

      try {
        const photoRes = await fetch(`http://localhost:8081/photos/${u.model_id}`);
        const photos = await photoRes.json();

        if (photos.length > 0 && photos[0].path) {
          foto = `http://localhost:8081${photos[0].path}`;
        }
      } catch {}

      container.innerHTML += `
        <div class="urun-kutu">
          <img src="${foto}" alt="${u.model_ad}">
          <h3>${u.model_ad}</h3>
          <p>${u.aciklama || ""}</p>
          <strong>${u.kira_fiyat} TL</strong>
          <a href="product.html?id=${u.model_id}" class="detay-btn">
            İncele
          </a>
        </div>
      `;
    }

  } catch (err) {
    console.error("Mağaza ürünleri yüklenemedi:", err);
  }
}
