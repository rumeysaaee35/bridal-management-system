
let allProducts = [];

// SAYFA AÇILINCA TÜM ÜRÜNLERİ ÇEK
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(API_URL);
    allProducts = await res.json();
  } catch (err) {
    console.error("Ürünler çekilemedi:", err);
  }
});

// ARAMA
function searchProduct() {
  const q = document.getElementById("searchInput").value.toLowerCase();
  const box = document.getElementById("searchResults");
  box.innerHTML = "";

  if (!q) return;

  const filtered = allProducts.filter(u =>
    u.model_ad.toLowerCase().includes(q) ||
    (u.aciklama && u.aciklama.toLowerCase().includes(q))
  );

  if (filtered.length === 0) {
    box.innerHTML = `<p>Sonuç bulunamadı.</p>`;
    return;
  }

  filtered.forEach(u => {
    box.innerHTML += `
      <div class="urun-kutu" onclick="goDetail(${u.model_id})">
        <img src="http://localhost:8081/${u.kapak_foto}">
        <h3>${u.model_ad}</h3>
        <strong>${u.satis_fiyat} TL</strong>
      </div>
    `;
  });
}

// ÜRÜN DETAY
function goDetail(id) {
  window.location.href = `product.html?id=${id}`;
}
