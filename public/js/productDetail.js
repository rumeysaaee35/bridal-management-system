// URL'den ID'yi al (?id=5 gibi)
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let currentProduct = null;

document.addEventListener("DOMContentLoaded", () => {
    if(!productId) {
        alert("Ürün bulunamadı!");
        window.location.href = "/index.html";
        return;
    }
    loadProductDetails();
    setupSizeChart();
    setupSelection();
});

// 1. ÜRÜN DETAYINI ÇEK
async function loadProductDetails() {
    try {
        // Aradaki "detay" kelimesini sildik çünkü backend /api/urunler/5 şeklinde bekliyor
        const res = await fetch(`/api/urunler/${productId}`); 
        
        // Eğer hala hata alırsan cevabın JSON olup olmadığını kontrol et
        if (!res.ok) throw new Error("Sunucu hatası: " + res.status);
        
        const data = await res.json();
        // Metinleri Doldur
        document.getElementById("modelAd").innerText = data.model_ad;
        document.getElementById("modelId").innerText = data.model_id;
        document.getElementById("urunAciklama").innerText = data.aciklama || "Açıklama bulunmuyor.";
        
        document.getElementById("satisFiyat").innerText = data.satis_fiyat + " ₺";
        document.getElementById("kiraFiyat").innerText = (data.kira_fiyat || "Fiyat Sorunuz") + " ₺";

        // RESİMLERİ AYARLA
        const mainImg = document.getElementById("mainImage");
        const track = document.getElementById("thumbnailTrack");
        
        // Ana resim (varsayılan)
        let firstImg = 'https://placehold.co/600x800?text=Resim+Yok';
        if(data.fotolar && data.fotolar.length > 0) {
            firstImg = fixPath(data.fotolar[0]);
        }
        mainImg.src = firstImg;

        // Thumbnails (Küçük Resimler)
        track.innerHTML = "";
        if(data.fotolar) {
            data.fotolar.forEach((path, index) => {
                const fullPath = fixPath(path);
                track.innerHTML += `
                    <img src="${fullPath}" class="thumb ${index===0 ? 'active':''}" onclick="changeImage('${fullPath}', this)">
                `;
            });
        }

        // BENZER ÜRÜNLERİ ÇEK
        loadSimilarProducts(data.renk_adi, data.satis_fiyat);

    } catch (err) {
        console.error("Hata:", err);
    }
}

// Resim değiştirme fonksiyonu
window.changeImage = function(src, element) {
    document.getElementById("mainImage").src = src;
    // Aktif çerçeveyi değiştir
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
}

// Resim yolu düzeltici (Yardımcı)
function fixPath(path) {
    if(!path) return 'https://placehold.co/600x800';
    let clean = path.replace(/\\/g, "/");
    if(clean.startsWith("uploads") || clean.startsWith("/uploads")) {
        return clean.startsWith("/") ? clean : "/" + clean;
    }
    return "/uploads/" + (clean.startsWith("/") ? clean.substring(1) : clean);
}

// 2. BENZER ÜRÜNLERİ GETİR
async function loadSimilarProducts(renk, fiyat) {
    try {
        const res = await fetch(`/api/urunler/benzer?id=${productId}&renk=${renk}&fiyat=${fiyat}`);
        const similar = await res.json();
        const container = document.getElementById("similarList");
        
        container.innerHTML = "";
        similar.forEach(p => {
            const img = fixPath(p.resim);
            container.innerHTML += `
                <div class="similar-card">
                    <a href="urun-detay.html?id=${p.model_id}">
                        <img src="${img}" alt="${p.model_ad}">
                        <h4>${p.model_ad}</h4>
                        <p>${p.satis_fiyat} ₺</p>
                    </a>
                </div>
            `;
        });
    } catch(err) { console.error(err); }
}

// 3. SEPETE EKLEME
window.sepeteEkle = function() {
    // Beden seçili mi kontrol et
    const selectedSize = document.querySelector('.size-box.selected');
    if(!selectedSize) {
        alert("Lütfen bir beden seçiniz!");
        return;
    }

    // LocalStorage Sepet Mantığı (Şimdilik Frontend'de tutalım, sonra DB'ye yollarız)
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    
    // Sepette var mı?
    const varMi = sepet.find(item => item.id == productId && item.beden == selectedSize.innerText);
    
    if(varMi) {
        varMi.adet++;
    } else {
        sepet.push({
            id: productId,
            ad: currentProduct.model_ad,
            fiyat: currentProduct.satis_fiyat,
            resim: document.getElementById("mainImage").src,
            beden: selectedSize.innerText,
            adet: 1
        });
    }

    localStorage.setItem("sepet", JSON.stringify(sepet));
    alert("Ürün sepete eklendi!");
    // Header'daki sepet sayısını güncellemek için bir event tetikleyebiliriz
    window.location.reload(); 
}

// 4. FAVORİYE EKLEME
window.favoriyeEkle = async function() {
    // 1. Giriş kontrolü
    const tel = localStorage.getItem("musteriTel");
    if (!tel) {
        const giris = prompt("Favorilere eklemek için lütfen telefon numaranızı giriniz:");
        if (giris) {
            localStorage.setItem("musteriTel", giris);
            // Sayfayı yenilemeye gerek yok, işleme devam edelim
        } else {
            return;
        }
    }

    const currentTel = localStorage.getItem("musteriTel");

    // 2. Backend'e gönder
    try {
        const res = await fetch("/api/musteri/favori-islem", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tel: currentTel, model_id: productId })
        });
        const result = await res.json();
        
        if (result.status === 'added') {
            alert("❤️ Ürün favorilere eklendi!");
        } else {
            alert("💔 Ürün favorilerden çıkarıldı.");
        }
    } catch (err) {
        console.error(err);
        alert("İşlem hatası.");
    }
}

// 5. RANDEVU YÖNLENDİRME
window.randevuAlYonlendir = function() {
    // Randevu sayfasına ürün adını taşıyarak git
    const model = currentProduct ? currentProduct.model_ad : "";
    window.location.href = `/randevu.html?model=${encodeURIComponent(model)}`;
}

// UI: Beden Seçimi & Modal
function setupSelection() {
    const sizes = document.querySelectorAll('.size-box');
    sizes.forEach(s => {
        s.addEventListener('click', () => {
            sizes.forEach(box => box.classList.remove('selected'));
            s.classList.add('selected');
        });
    });
}

function setupSizeChart() {
    const modal = document.getElementById("sizeModal");
    const btn = document.getElementById("openSizeChart");
    const span = document.getElementsByClassName("close-modal")[0];

    btn.onclick = () => modal.classList.remove("hidden");
    span.onclick = () => modal.classList.add("hidden");
    window.onclick = (event) => {
        if (event.target == modal) modal.classList.add("hidden");
    }
}