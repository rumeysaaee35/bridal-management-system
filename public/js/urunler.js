
document.addEventListener("DOMContentLoaded", () => {
    urunleriGetir(); 

    const renkKutulari = document.querySelectorAll(".filter-renk");
    renkKutulari.forEach(span => {
        span.addEventListener("click", () => {
            renkKutulari.forEach(s => s.classList.remove("active"));
            span.classList.add("active");
            filtreUygula();
        });
    });

    const minRange = document.getElementById("minFiyat");
    const maxRange = document.getElementById("maxFiyat");
    const fiyatText = document.getElementById("fiyatText");

    function updatePriceText() {
        fiyatText.innerText = `${minRange.value} ₺ - ${maxRange.value} ₺`;
    }

    minRange.addEventListener("input", updatePriceText);
    maxRange.addEventListener("input", updatePriceText);
});

async function urunleriGetir(filtreler = {}) {
    const container = document.getElementById("urunListesi");
    container.innerHTML = "<p style='text-align:center; width:100%'>Ürünler yükleniyor...</p>";

    let url = "/api/urunler?";

    const params = new URLSearchParams();

    if (filtreler.kategori) params.append("kategori", filtreler.kategori);
    if (filtreler.renk) params.append("renk", filtreler.renk);

    if (filtreler.minFiyat) params.append("minFiyat", filtreler.minFiyat);
    if (filtreler.maxFiyat) params.append("maxFiyat", filtreler.maxFiyat);

    try {
        const response = await fetch(url + params.toString());
        const products = await response.json();

        container.innerHTML = "";

        if (products.length === 0) {
            container.innerHTML = "<p>Aradığınız kriterde ürün bulunamadı.</p>";
            return;
        }

        products.forEach(urun => {
             let resimYolu = 'https://placehold.co/600x400?text=Resim+Yok';
             if (urun.resim) {
                 const temizYol = urun.resim.startsWith("/") ? urun.resim.substring(1) : urun.resim;
                 resimYolu = urun.resim.startsWith("http") ? urun.resim : `/${temizYol}`;
             }

            container.innerHTML += `
                <div class="urun-kutu">
                    <img src="${resimYolu}" alt="${urun.model_ad}">
                    <h3>${urun.model_ad}</h3>
                    <div class="price-box-list">
                        <strong>${urun.satis_fiyat} ₺</strong>
                    </div>
                    <a href="/urun-detay.html?id=${urun.model_id}" class="btn">İNCELE</a>
                </div>
            `;
        });

    } catch (error) {
        console.error("Hata:", error);
        container.innerHTML = "<p>Bir hata oluştu.</p>";
    }
}
window.filtreUygula = function() {
    const kategoriInput = document.querySelector('input[name="kategori"]:checked');
    const renkSpan = document.querySelector('.filter-renk.active'); 
    const minFiyat = document.getElementById("minFiyat").value;
    const maxFiyat = document.getElementById("maxFiyat").value;

    const filtreler = {
        kategori: kategoriInput ? kategoriInput.value : null,
        renk: renkSpan ? renkSpan.getAttribute("data-value") : null,
        minFiyat: minFiyat,
        maxFiyat: maxFiyat
    };

    urunleriGetir(filtreler);
}
window.filtreSifirla = function() 
{
    const radyolar = document.querySelectorAll('input[name="kategori"]');
    radyolar.forEach(r => r.checked = false);

    document.querySelectorAll('.filter-renk').forEach(s => s.classList.remove('active'));

    
    document.getElementById("minFiyat").value = 0;
    document.getElementById("maxFiyat").value = 50000;
    document.getElementById("fiyatText").innerText = "0 ₺ - 50.000 ₺";

    
    urunleriGetir();
}
