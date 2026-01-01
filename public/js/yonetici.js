let incomeChart, revenueSplitChart, seasonalityChart, stockChart, tumStokVerisi = [];

document.addEventListener("DOMContentLoaded", () => { 
    loadDashboard(); 
    loadUrunlerSelect(); 
});

function switchTab(id, el) {
    document.querySelectorAll('.tab-section').forEach(e => e.classList.remove('active'));
    document.getElementById('tab-' + id).classList.add('active');
    document.querySelectorAll('.nav-link').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    
    const titles = { 'ozet':'Genel Özet', 'satislar':'Satış Analizi', 'randevular':'Randevular', 'satis-ekle':'Satış Gir', 'stok':'Stok Takibi' };
    document.getElementById('page-title').innerText = titles[id] || 'Yönetim Paneli';

    if(id === 'ozet') loadDashboard();
    if(id === 'satislar') loadSatislar();
    if(id === 'randevular') loadRandevular();
    if(id === 'stok') loadStok();
}
async function loadDashboard() {
    try {
        const yilSelect = document.getElementById('yilFiltresi');
        const secilenYil = yilSelect ? yilSelect.value : new Date().getFullYear();

        const res = await fetch(`/api/yonetici/dashboard-stats?yil=${secilenYil}`);
        const data = await res.json();
        
        document.getElementById('stat-ciro').innerText = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(data.kartlar.toplam_ciro || 0);
        document.getElementById('stat-satis').innerText = (data.kartlar.toplam_satis + data.kartlar.toplam_kiralama);
        document.getElementById('stat-randevu').innerText = data.kartlar.toplam_randevu;
        document.getElementById('stat-stok').innerText = data.kartlar.kritik_stok;

        document.getElementById('son-hareketler-body').innerHTML = data.tablo.map(i => {
            let badgeClass = 'bg-secondary'; // Varsayılan: Bekliyor
            const durum = i.siparis_durumu || 'Bekliyor';
            
            if (durum === 'Teslim Edildi') badgeClass = 'bg-success';
            else if (durum === 'Dikiliyor') badgeClass = 'bg-info text-dark';
            else if (durum === 'Hazır') badgeClass = 'bg-primary';
            else if (durum === 'İptal') badgeClass = 'bg-danger';

            return `
            <tr>
                <td>${new Date(i.satis_tarihi).toLocaleDateString('tr-TR')}</td>
                <td>${i.musteri}</td>
                <td><span class="badge ${i.islem_turu==='kiralama'?'bg-warning text-dark':'bg-success'}">${i.islem_turu}</span></td>
                <td class="text-success fw-bold">${i.toplam_tutar} ₺</td>
                <td><span class="badge ${badgeClass}">${durum}</span></td>
            </tr>`;
        }).join('');
        if(yilSelect && yilSelect.options.length <= 1 && data.yillar && data.yillar.length > 0) {
            const mevcut = yilSelect.value;
            yilSelect.innerHTML = "";
            data.yillar.forEach(y => {
                const opt = document.createElement('option');
                opt.value = y;
                opt.innerText = y;
                if(y == mevcut) opt.selected = true;
                yilSelect.appendChild(opt);
            });
        }

        drawIncome(data.gelir_verileri);
        drawSplit(data.gelir_verileri);
        drawSeason(data.musteri_verileri);

    } catch (e) { console.error("Dashboard hatası:", e); }
}

async function loadSatislar() { 
    const r = await fetch("/api/yonetici/satislar"); 
    const d = await r.json(); 
    
    document.getElementById('satis-listesi-body').innerHTML = d.map(s => {
        let badgeClass = 'bg-secondary';
        const durum = s.siparis_durumu || 'Bekliyor';
        
        if (durum === 'Teslim Edildi') badgeClass = 'bg-success';
        else if (durum === 'Dikiliyor') badgeClass = 'bg-info text-dark';
        else if (durum === 'Hazır') badgeClass = 'bg-primary';
        else if (durum === 'İptal') badgeClass = 'bg-danger';

        return `
        <tr>
            <td>${new Date(s.satis_tarihi).toLocaleDateString("tr-TR")}</td>
            <td>${s.musteri_ad}</td>
            <td>${s.model_ad}</td>
            <td>${s.islem_turu}</td>
            <td>${s.adet}</td>
            <td>${s.toplam_tutar} ₺</td>
            <td><span class="badge ${badgeClass}">${durum}</span></td>
        </tr>`;
    }).join(''); 
}
function drawIncome(data) {
    const ctx = document.getElementById('incomeChart'); if(!ctx) return;
    if(incomeChart) incomeChart.destroy();
    const lbl = data && data.length ? data.map(d=>d.ay) : ['Veri Yok'];
    const val = data && data.length ? data.map(d=>d.toplam_gelir) : [0];
    incomeChart = new Chart(ctx, { type: 'bar', data: { labels: lbl, datasets: [{ label: 'Ciro', data: val, backgroundColor: '#11998e', borderRadius: 5 }] }, options: { maintainAspectRatio: false } });
}

function drawSplit(data) {
    const ctx = document.getElementById('revenueSplitChart'); if(!ctx) return;
    if(revenueSplitChart) revenueSplitChart.destroy();
    let s=0, k=0;
    if(data) data.forEach(d=>{ s+=Number(d.satis_geliri||0); k+=Number(d.kiralama_geliri||0); });
    revenueSplitChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Satış','Kira'], datasets: [{ data: [s,k], backgroundColor: ['#FF416C','#f5af19'] }] }, options: { maintainAspectRatio: false } });
}

function drawSeason(data) {
    const ctx = document.getElementById('seasonalityChart'); if(!ctx) return;
    if(seasonalityChart) seasonalityChart.destroy();
    const lbl = data && data.length ? data.map(d=>d.ay) : ['Veri Yok'];
    const val = data && data.length ? data.map(d=>d.musteri_sayisi) : [0];
    seasonalityChart = new Chart(ctx, { type: 'line', data: { labels: lbl, datasets: [{ label: 'Müşteri', data: val, borderColor: '#3b82f6', fill: true, tension: 0.4 }] }, options: { maintainAspectRatio: false } });
}

async function loadRandevular() { 
    try {
        const r = await fetch("/api/yonetici/randevular"); 
        const d = await r.json(); 
        
        document.getElementById('randevu-listesi-body').innerHTML = d.map(r => {
            // Onay durumuna göre renkli badge belirleyelim
            let badgeClass = 'bg-secondary';
            if (r.onay_durumu === 'Onaylandı') badgeClass = 'bg-success';
            else if (r.onay_durumu === 'İptal Edildi') badgeClass = 'bg-danger';

            return `
            <tr>
                <td>${new Date(r.randevu_tarih).toLocaleDateString("tr-TR")}</td>
                <td>${r.saat}</td> <td>${r.musteri_ad} ${r.musteri_soyad || ''}</td> <td>${r.telefon_no}</td> <td><span class="badge ${badgeClass}">${r.onay_durumu || 'Bekliyor'}</span></td>
                <td><small>${r.notlar || '-'}</small></td>
            </tr>`;
        }).join(''); 
    } catch (e) {
        console.error("Randevu listesi yüklenemedi:", e);
    }
}
async function loadUrunlerSelect() { 
    const r = await fetch("/api/yonetici/urunler-basit"); const d = await r.json(); 
    const s = document.getElementById('urunSelect'); if(!s) return;
    s.innerHTML = '<option value="">Seç...</option>'; 
    d.forEach(u => { const o = document.createElement('option'); o.value=u.model_id; o.innerText=u.model_ad; o.dataset.s=u.satis_fiyat; o.dataset.k=u.kira_fiyat; s.appendChild(o); });
    s.onchange = () => { const o = s.options[s.selectedIndex]; document.getElementById('fiyat').value = document.getElementById('islemTuru').value==='satis'?o.dataset.s:o.dataset.k; };
}
async function satisKaydet(e) {
    e.preventDefault();
    const p = { musteri_ad: document.getElementById('musteriAd').value, telefon_no: document.getElementById('musteriTel').value, model_id: document.getElementById('urunSelect').value, islem_turu: document.getElementById('islemTuru').value, adet: document.getElementById('adet').value, birim_fiyat: document.getElementById('fiyat').value };
    await fetch("/api/yonetici/satis-ekle", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(p) });
    Swal.fire("Başarılı","Kaydedildi","success"); e.target.reset(); loadDashboard();
}
async function loadStok() { const r = await fetch("/api/yonetici/stok"); tumStokVerisi = await r.json(); stokTablo(tumStokVerisi); stokGrafik(tumStokVerisi); }
function stokTablo(d) {
    document.getElementById('stok-listesi-body').innerHTML = d.map(i => {
        const stok = Number(i.stok);
        const sinir = Number(i.kritik_sinir);
        
        let statusBadge = '';
        let stokColor = 'text-dark';

        if (stok <= sinir) {
            stokColor = 'text-danger fw-bold';
            statusBadge = `
                <span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-3 py-2 w-100">
                    <i class="fas fa-exclamation-triangle me-1"></i> KRİTİK SEVİYE
                </span>`;
        } else if (stok <= sinir + 5) {
            stokColor = 'text-warning fw-bold';
            statusBadge = `
                <span class="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-3 py-2 w-100">
                    <i class="fas fa-clock me-1"></i> STOK AZALIYOR
                </span>`;
        } else {
            statusBadge = `
                <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 w-100">
                    <i class="fas fa-check-circle me-1"></i> STOK GÜVENLİ
                </span>`;
        }

        return `
            <tr class="align-middle">
                <td class="fw-semibold" style="width: 40%;">${i.model_ad}</td>
                <td class="${stokColor}" style="width: 30%; font-size: 1.1rem;">${stok} Adet</td>
                <td style="width: 30%;">${statusBadge}</td>
            </tr>`;
    }).join('');
}
function stokGrafik(d) {
    const ctx = document.getElementById('stokGrafigi'); if(!ctx) return; if(stockChart) stockChart.destroy();
    stockChart = new Chart(ctx, { type: 'bar', data: { labels: d.map(i=>i.model_ad), datasets: [{ type:'line', label:'Sınır', data: d.map(i=>i.kritik_sinir), borderColor:'red' }, { label:'Stok', data: d.map(i=>i.stok), backgroundColor:'#3b82f6' }] }, options: { maintainAspectRatio: false } });
}
function filtrele() { const k = tumStokVerisi.filter(i=>i.stok<=i.kritik_sinir); stokTablo(k.length?k:tumStokVerisi); Swal.fire("Bilgi", k.length?k.length+" adet kritik var":"Kritik yok", "info"); }
