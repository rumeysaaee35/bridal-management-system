async function musteriPaneliAc() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        return Swal.fire("Giriş Yapın", "Bu alanı görmek için lütfen önce giriş yapın.", "info");
    }

    const tel = user.telefon || user.telefon_no;

    Swal.fire({
        title: 'Müşteri Paneli',
        html: `
            <div style="display:flex; flex-direction:column; gap:10px;">
                <button onclick="showSiparisTakipPopUp('${tel}')" style="padding:12px; background:#333; color:#fff; border:none; border-radius:8px; cursor:pointer;">📦 Sipariş Takibim</button>
                <button onclick="showRandevuPopUp('${tel}')" style="padding:12px; background:#ff3366; color:#fff; border:none; border-radius:8px; cursor:pointer;">📅 Randevularım (Onay/İptal)</button>
            </div>
        `,
        showConfirmButton: false
    });
}

async function showRandevuPopUp(tel) {
    try {
        const res = await fetch(`/api/musteri/randevularim?tel=${tel}`);
        const data = await res.json();

        let html = '<div style="text-align:left; max-height:300px; overflow-y:auto;">';
        if (data.length === 0) {
            html += '<p>Kayıtlı randevunuz bulunamadı.</p>';
        } else {
            data.forEach(r => {
                const rVakti = new Date(`${r.randevu_tarih.split('T')[0]}T${r.randevu_saat}`);
                const suAn = new Date();
                const farkSaat = (rVakti - suAn) / (1000 * 60 * 60);

                let islem = "";
                if (farkSaat > 2 && (!r.onay_durumu || r.onay_durumu === 'Bekliyor')) {
                    islem = `
                        <button onclick="randevuDurumGuncelle(${r.randevu_id}, 'Onaylandı')" style="background:green; color:#fff; border:none; padding:5px; border-radius:4px;">Onayla</button>
                        <button onclick="randevuDurumGuncelle(${r.randevu_id}, 'İptal Edildi')" style="background:red; color:#fff; border:none; padding:5px; border-radius:4px;">İptal</button>
                    `;
                } else {
                    islem = `<b style="color:${r.onay_durumu === 'Onaylandı' ? 'green' : 'red'}">${r.onay_durumu || 'Süresi Geçti'}</b>`;
                }

                html += `<div style="padding:8px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center;">
                    <span>${new Date(r.randevu_tarih).toLocaleDateString('tr-TR')} - ${r.randevu_saat}</span>
                    <div>${islem}</div>
                </div>`;
            });
        }
        html += '</div>';

        Swal.fire({ title: 'Randevularım', html: html, confirmButtonText: 'Geri', preConfirm: () => musteriPaneliAc() });
    } catch (e) { Swal.fire("Hata", "Veriler alınamadı.", "error"); }
}

async function randevuDurumGuncelle(id, durum) {
    await fetch(`/api/musteri/randevu-islem/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum })
    });
    Swal.fire("Başarılı", "Randevu durumu güncellendi.", "success").then(() => musteriPaneliAc());
}
async function showSiparisTakipPopUp(tel) {
    try {
        const res = await fetch(`/api/musteri/siparislerim?tel=${tel}`);
        const data = await res.json();

        let html = '<div style="text-align:left;">';
        if (data.length === 0) {
            html += '<p>Henüz aktif bir siparişiniz bulunmamaktadır.</p>';
        } else {
            data.forEach(s => {
                html += `
                    <div style="padding:10px; border-bottom:1px solid #eee;">
                        <strong>Sipariş No: #${s.siparis_id || s.id}</strong><br>
                        <span>Durum: <b style="color:blue;">${s.durum || 'Hazırlanıyor'}</b></span>
                    </div>`;
            });
        }
        html += '</div>';

        Swal.fire({ title: '📦 Sipariş Takibi', html: html, confirmButtonText: 'Geri', preConfirm: () => musteriPaneliAc() });
    } catch (e) { Swal.fire("Hata", "Sipariş bilgileri alınamadı.", "error"); }
}

