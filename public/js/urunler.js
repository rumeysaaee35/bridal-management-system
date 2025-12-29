// public/js/urunler.js

document.addEventListener("DOMContentLoaded", () => {
    urunleriGetir(); // Sayfa açılınca ürünleri yükle

    // RENK SEÇİMİ AYARI (Spanlara tıklayınca seçili yapma)
    const renkKutulari = document.querySelectorAll(".filter-renk");
    renkKutulari.forEach(span => {
        span.addEventListener("click", () => {
            // Önce diğerlerinden seçimi kaldır (Tek renk seçimi için)
            renkKutulari.forEach(s => s.classList.remove("active"));
            // Tıklanana ekle
            span.classList.add("active");
            // Otomatik filtrele (İstersen butona basınca yapması için burayı sil)
            filtreUygula();
        });
    });

    // FİYAT SLIDER AYARI (Değer değiştikçe yazıyı güncelle)
    const minRange = document.getElementById("minFiyat");
    const maxRange = document.getElementById("maxFiyat");
    const fiyatText = document.getElementById("fiyatText");

    function updatePriceText() {
        fiyatText.innerText = `${minRange.value} ₺ - ${maxRange.value} ₺`;
    }

    minRange.addEventListener("input", updatePriceText);
    maxRange.addEventListener("input", updatePriceText);
});


// FİLTRELEME VE GETİRME FONKSİYONU
async function urunleriGetir(filtreler = {}) {
    const container = document.getElementById("urunListesi");
    container.innerHTML = "<p style='text-align:center; width:100%'>Ürünler yükleniyor...</p>";

    let url = "/api/urunler?";

    // 1. URL Parametrelerini Oluştur
    const params = new URLSearchParams();

    // Kategori (Radio)
    if (filtreler.kategori) params.append("kategori", filtreler.kategori);
    
    // Renk (Span'dan gelen)
    if (filtreler.renk) params.append("renk", filtreler.renk);

    // Fiyat
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
             // Resim yolu düzeltme
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

// "UYGULA" BUTONUNA BASINCA ÇALIŞACAK FONKSİYON
window.filtreUygula = function() {
    // HTML'den seçili değerleri topla
    const kategoriInput = document.querySelector('input[name="kategori"]:checked');
    const renkSpan = document.querySelector('.filter-renk.active'); // Active sınıfı olan span
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

// "SIFIRLA" BUTONU
window.filtreSifirla = function() {
    // Radyo butonlarını temizle
    const radyolar = document.querySelectorAll('input[name="kategori"]');
    radyolar.forEach(r => r.checked = false);

    // Renk seçimini temizle
    document.querySelectorAll('.filter-renk').forEach(s => s.classList.remove('active'));

    // Fiyatı sıfırla
    document.getElementById("minFiyat").value = 0;
    document.getElementById("maxFiyat").value = 50000;
    document.getElementById("fiyatText").innerText = "0 ₺ - 50.000 ₺";

    // Ürünleri filtresiz getir
    urunleriGetir();
}