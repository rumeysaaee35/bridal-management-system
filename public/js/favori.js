
async function favorileriGetir() {
    const user = JSON.parse(localStorage.getItem('user'));
    const tel = user ? user.telefon : ''; 

    if (!tel) {
        console.warn("Kullanıcı girişi bulunamadı.");
        return;
    }

    try {
        const res = await fetch(`/api/musteri/favorilerim?tel=${tel}`);
        const data = await res.json();
        
        const listContainer = document.getElementById('favoriListesi');
        if (data.length === 0) {
            document.getElementById('bosMesaj').style.display = 'block';
        } else {
            listContainer.innerHTML = data.map(f => `
                <div class="urun-card">
                    <img src="/uploads/${f.resim_url}" onerror="this.src='/img/placeholder.jpg'">
                    <h3>${f.model_ad}</h3>
                    <p>${f.satis_fiyat} ₺</p>
                    <button onclick="favoridenSil('${f.favori_id}')">Sil</button>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }
}
    favoriler.forEach(urun => {
        const urunHTML = `
            <div class="urun-card" style="border:1px solid #ddd; padding:10px; margin:10px; width: 200px; display:inline-block; text-align:center;">
                <div class="img-box" style="position:relative;">
                    <img src="${urun.image}" alt="${urun.title}" style="width:100%; height:auto;">
                    
                    <i class="fa-solid fa-heart" 
                       onclick="favoridenSil('${urun.title}')" 
                       style="color:red; position:absolute; top:10px; right:10px; cursor:pointer; background:#fff; padding:5px; border-radius:50%;">
                    </i>
                </div>
                <h3>${urun.title}</h3>
                <p class="price">${urun.price}</p>
                <a href="#" class="btn-incele">İncele</a>
            </div>
        `;
        listContainer.innerHTML += urunHTML;
    });

window.favoridenSil = function(baslik) {
    let favoriler = JSON.parse(localStorage.getItem('favoriler')) || [];
    favoriler = favoriler.filter(item => item.title !== baslik);
    localStorage.setItem('favoriler', JSON.stringify(favoriler));
    
    favorileriGetir();
};
document.addEventListener('DOMContentLoaded', favorileriGetir);
