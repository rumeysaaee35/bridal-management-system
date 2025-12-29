// public/js/vitrin.js

async function loadVitrin() {
    try {
        const res = await fetch('/api/urunler/vitrin');
        const products = await res.json();
        const track = document.getElementById('vitrin-track');
        
        if (!track) return; 

        track.innerHTML = ""; 

        if(products.length === 0) {
            track.innerHTML = "<p style='width:100%; text-align:center'>Vitrin ürünü bulunamadı.</p>";
            return;
        }

        products.forEach(p => {
            // --- RESİM YOLU DÜZELTME MANTIĞI ---
            let imgUrl = 'https://placehold.co/300x450?text=Resim+Yok';
            
            if(p.resim) {
                // Windows ters slash'lerini düzelt (\ -> /)
                let hamYol = p.resim.replace(/\\/g, "/");

                // Eğer yol zaten "/uploads" veya "uploads" ile başlıyorsa tekrar ekleme
                if (hamYol.startsWith("uploads") || hamYol.startsWith("/uploads")) {
                    imgUrl = hamYol.startsWith("/") ? hamYol : "/" + hamYol;
                } else {
                    // Başlamıyorsa biz ekleyelim
                    imgUrl = "/uploads/" + (hamYol.startsWith("/") ? hamYol.substring(1) : hamYol);
                }
            }
            
            console.log(`Ürün: ${p.model_ad}, Resim Yolu: ${imgUrl}`); // Hata ayıklamak için konsola yaz

            track.innerHTML += `
                <div class="slider-card">
                    <div class="card-img">
                         <img src="${imgUrl}" alt="${p.model_ad}" onerror="this.onerror=null; this.src='https://placehold.co/300x450?text=Hata';">
                    </div>
                    <div class="card-info">
                        <h4>${p.model_ad}</h4>
                        <p class="price">${p.satis_fiyat} ₺</p>
                        <a href="urun-detay.html?id=${p.model_id}" class="incele-btn">İncele</a>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Vitrin hatası:", err);
    }
}

// Kaydırma Fonksiyonu
function scrollSlider(direction) {
    const track = document.getElementById('vitrin-track');
    if(track) {
        const scrollAmount = 300; 
        track.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
    }
}

document.addEventListener("DOMContentLoaded", loadVitrin);