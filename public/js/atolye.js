
let stokChart = null; 
let hammaddeChart = null; 
let isCriticalFilter = false;

document.addEventListener('DOMContentLoaded', () => {
    loadStoklar(); // Varsayılan açılış
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => input.value = today);

    const searchInput = document.getElementById('search-input');
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#table-body tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if(e.target.getAttribute('href')) return; 

            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        
            if(searchInput) searchInput.value = '';

            const page = e.target.getAttribute('data-page');
            if(page === 'stok') loadStoklar();
            if(page === 'siparis') loadSiparisler();
            if(page === 'uretim') loadUretimler();
            if(page === 'hammadde') loadHammadde();
        });
    });

    const uretimModal = document.getElementById('uretimModal');
    if(uretimModal) uretimModal.addEventListener('show.bs.modal', loadUretimOptions);

    const hammaddeModal = document.getElementById('hammaddeModal');
    if(hammaddeModal) hammaddeModal.addEventListener('show.bs.modal', loadHammaddeOptions);

    // Kritik Buton
    const filterBtn = document.getElementById('toggle-critical');
    if(filterBtn) {
        filterBtn.onclick = () => {
            isCriticalFilter = !isCriticalFilter;
            filterBtn.textContent = isCriticalFilter ? "Tümünü Göster" : "Kritik Olanlar";
            filterBtn.className = isCriticalFilter ? "btn btn-danger text-white" : "btn btn-light";
            loadStoklar();
        };
    }
});

function toggleElements(mode) {
    const stokGrafik = document.getElementById('grafik-alani');
    const hammaddeGrafik = document.getElementById('hammadde-grafik-alani'); // Yeni grafik alanı
    const uretimBtn = document.getElementById('btn-yeni-uretim');
    const hammaddeBtn = document.getElementById('btn-yeni-hammadde');
    const kritikBtn = document.getElementById('toggle-critical');
    const searchBox = document.querySelector('.search-box');

    if(stokGrafik) stokGrafik.style.display = 'none';
    if(hammaddeGrafik) hammaddeGrafik.style.display = 'none';
    if(uretimBtn) uretimBtn.style.display = 'none';
    if(hammaddeBtn) hammaddeBtn.style.display = 'none';
    if(kritikBtn) kritikBtn.style.display = 'none';
    if(searchBox) searchBox.style.display = 'block';

    if(mode === 'stok') {
        if(stokGrafik) stokGrafik.style.display = 'flex';
        if(kritikBtn) kritikBtn.style.display = 'block';
    }
    if(mode === 'uretim') {
        if(uretimBtn) uretimBtn.style.display = 'block';
        if(searchBox) searchBox.style.display = 'none';
    }
    if(mode === 'hammadde') {
        if(hammaddeBtn) hammaddeBtn.style.display = 'block';
        if(hammaddeGrafik) hammaddeGrafik.style.display = 'block'; // Grafiği göster
    }
}

async function loadHammadde() {
    setTitle("Hammadde İhtiyaç Analizi");
    toggleElements('hammadde');
    setTableHead(['Model', 'Gerekli Hammadde', 'Birim İhtiyaç', 'Depo Stoğu', 'Durum']);
    
    loadHammaddeGrafik(); 

    try {
        const res = await fetch('/api/atolye/malzeme-giderleri');
        const data = await res.json();
        const rows = data.map(item => {
            const yetiyorMu = item.stok_miktari >= item.gerekli_miktar;
            return `<tr>
                <td><strong>${item.model_ad}</strong><br><small>${item.model_renk}</small></td>
                <td>${item.hammadde_ad}<br><small>${item.hammadde_renk || ''}</small></td>
                <td>${item.gerekli_miktar} ${item.birim || ''}</td>
                <td>${item.stok_miktari} ${item.birim || ''}</td>
                <td>${yetiyorMu ? '<span class="badge bg-success">Yeterli</span>' : '<span class="badge bg-danger">Yetersiz</span>'}</td>
            </tr>`;
        }).join('');
        document.getElementById('table-body').innerHTML = rows;
    } catch (err) { showError(err); }
}

async function loadHammaddeGrafik() {
    try {
        const res = await fetch('/api/atolye/hammadde-grafik');
        const data = await res.json();

        const ctx = document.getElementById('hammaddeChart');
        if (!ctx) return;

        if (hammaddeChart) hammaddeChart.destroy();

        if (data.length === 0) return;

        const labels = data.map(item => item.hammadde_ad);
        const stoklar = data.map(item => item.stok_miktari);
        const sinirlar = data.map(item => item.kritik_sinir);

        hammaddeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Mevcut Stok',
                        data: stoklar,
                        backgroundColor: '#dc3545',
                        borderColor: '#b02a37',
                        borderWidth: 1,
                        borderRadius: 5,
                    },
                    {
                        label: 'Kritik Sınır (Min)',
                        data: sinirlar,
                        type: 'line',
                        borderColor: '#333',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                indexAxis: 'y', // Yatay bar
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { beginAtZero: true } }
            }
        });
    } catch (error) { console.error("Grafik yüklenemedi:", error); }
}

async function loadHammaddeOptions() {
    const select = document.getElementById('select-hammadde');
    select.innerHTML = '<option value="">Yükleniyor...</option>';
    try {
        const res = await fetch('/api/atolye/hammadde-listesi');
        const data = await res.json();
        let options = '<option value="">Malzeme Seçiniz...</option>';
        data.forEach(item => {
            options += `<option value="${item.stok_id}" data-birim="${item.birim}">${item.hammadde_ad} (${item.renk}) - Mevcut: ${item.mevcut_adet} ${item.birim}</option>`;
        });
        select.innerHTML = options;
        select.onchange = function() {
            const selectedOpt = this.options[this.selectedIndex];
            document.getElementById('hammadde-birim').textContent = selectedOpt.getAttribute('data-birim') || '-';
        };
    } catch (error) { select.innerHTML = '<option value="">Hata!</option>'; }
}

async function hammaddeKaydet() {
    const stokId = document.getElementById('select-hammadde').value;
    const miktar = document.getElementById('input-hammadde-adet').value;
    const tarih = document.getElementById('input-hammadde-tarih').value;
    if(!stokId || !miktar || !tarih) { alert("Doldurunuz"); return; }
    try {
        const res = await fetch('/api/atolye/hammadde-giris', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ stok_id: stokId, miktar, tarih }) });
        if(res.ok) { alert("Başarılı!"); bootstrap.Modal.getInstance(document.getElementById('hammaddeModal')).hide(); loadHammadde(); }
        else { const r = await res.json(); alert(r.error); }
    } catch (e) { alert("Hata"); }
}

async function loadStoklar() {
    setTitle("Model Stokları");
    toggleElements('stok'); 
    loadStokGrafigi();
    setTableHead(['Model', 'Renk', 'Mevcut Adet', 'Durum']);
    try {
        const res = await fetch('/api/atolye/model-stoklari');
        let data = await res.json();
        updateIstatistikKartlari(data);
        if(isCriticalFilter) data = data.filter(item => item.mevcut_adet < item.kritik_sinir);
        const rows = data.map(item => `<tr>
            <td><strong>${item.model_ad}</strong></td>
            <td>${item.renk || '-'}</td>
            <td>${item.mevcut_adet}</td>
            <td>${item.mevcut_adet < item.kritik_sinir ? '<span class="badge bg-danger">Kritik</span>' : '<span class="badge bg-success">Yeterli</span>'}</td>
        </tr>`).join('');
        document.getElementById('table-body').innerHTML = rows;
    } catch (err) { showError(err); }
}

async function loadSiparisler() {
    setTitle("Mağaza Satışları");
    toggleElements('siparis');
    setTableHead(['ID', 'Tarih', 'Müşteri', 'Model', 'Renk/Beden', 'Durum']);
    try {
        const res = await fetch('/api/atolye/magaza-satislari');
        const data = await res.json();
        const rows = data.map(item => {
            const durum = item.siparis_durumu || 'Bekliyor';
            let btnClass = 'btn-secondary';
            if(durum === 'Hazır') btnClass = 'btn-primary';
            if(durum === 'Teslim Edildi') btnClass = 'btn-success';
            if(durum === 'İptal') btnClass = 'btn-danger';
            const dropdownHtml = `<div class="dropdown">
                <button class="btn btn-sm ${btnClass} dropdown-toggle" type="button" data-bs-toggle="dropdown">${durum}</button>
                <ul class="dropdown-menu shadow">
                    <li><a class="dropdown-item" onclick="durumDegistir(${item.satis_id}, 'Bekliyor')">Bekliyor</a></li>
                    <li><a class="dropdown-item" onclick="durumDegistir(${item.satis_id}, 'Dikiliyor')">Dikiliyor</a></li>
                    <li><a class="dropdown-item" onclick="durumDegistir(${item.satis_id}, 'Hazır')">Hazır</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-success" onclick="durumDegistir(${item.satis_id}, 'Teslim Edildi')">Teslim Edildi</a></li>
                </ul></div>`;
            return `<tr>
                <td>#${item.satis_id}</td>
                <td>${new Date(item.tarih).toLocaleDateString('tr-TR')}</td>
                <td>${item.musteri_ad}</td>
                <td>${item.model_ad}</td>
                <td>${item.renk} / ${item.beden}</td>
                <td>${dropdownHtml}</td>
            </tr>`;
        }).join('');
        document.getElementById('table-body').innerHTML = rows;
    } catch (err) { showError(err); }
}

async function loadUretimler() {
    setTitle("Geçmiş Üretim Listesi");
    toggleElements('uretim');
    setTableHead(['Üretim ID', 'Tarih', 'Model', 'Renk', 'Üretilen Adet']);
    try {
        const res = await fetch('/api/atolye/uretimler');
        const data = await res.json();
        const rows = data.map(item => `<tr>
            <td>#${item.uretim_id}</td>
            <td>${new Date(item.uretim_tarihi).toLocaleDateString('tr-TR')}</td>
            <td><strong>${item.model_ad}</strong></td>
            <td>${item.renk || '-'}</td>
            <td><span class="badge bg-primary fs-6 px-3">+${item.uretim_adet}</span></td>
        </tr>`).join('');
        document.getElementById('table-body').innerHTML = rows;
    } catch (err) { showError(err); }
}

async function loadUretimOptions() {
    const select = document.getElementById('select-model');
    select.innerHTML = '<option value="">Yükleniyor...</option>';
    try {
        const res = await fetch('/api/atolye/model-stoklari');
        const data = await res.json();
        let options = '<option value="">Model Seçiniz...</option>';
        data.forEach(item => { options += `<option value="${item.model_id}">${item.model_ad} (${item.renk})</option>`; });
        select.innerHTML = options;
    } catch (e) { select.innerHTML = '<option>Hata</option>'; }
}

async function uretimKaydet() {
    const modelId = document.getElementById('select-model').value;
    const adet = document.getElementById('input-adet').value;
    const tarih = document.getElementById('input-tarih').value;
    if(!modelId || !adet || !tarih) { alert("Doldurunuz"); return; }
    await fetch('/api/atolye/uretim', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({model_id:modelId, adet, tarih}) });
    alert('Kaydedildi');
    bootstrap.Modal.getInstance(document.getElementById('uretimModal')).hide();
    loadUretimler();
}

async function loadStokGrafigi() {
    if(!document.getElementById('kritikStokChart')) return;
    const ctx = document.getElementById('kritikStokChart').getContext('2d');
    const res = await fetch('/api/atolye/kritik-stok-orani');
    const data = await res.json();
    if (stokChart) stokChart.destroy();
    stokChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Kritik', 'Yeterli'], datasets: [{ data: [data.kritik, data.normal], backgroundColor: ['#dc3545', '#198754'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, cutout: '70%' } });
}

function updateIstatistikKartlari(data) {
    if(!document.getElementById('stat-toplam-model')) return;
    document.getElementById('stat-toplam-model').textContent = data.length;
    document.getElementById('stat-toplam-urun').textContent = data.reduce((acc, curr) => acc + (curr.mevcut_adet || 0), 0);
    const enKritik = data.length > 0 ? data.reduce((min, curr) => (curr.mevcut_adet < min.mevcut_adet ? curr : min), data[0]) : null;
    document.getElementById('stat-en-kritik').textContent = enKritik ? `${enKritik.model_ad} (${enKritik.mevcut_adet})` : "-";
}

async function durumDegistir(id, st) {
    if(typeof Swal !== 'undefined') {
        const result = await Swal.fire({ title: 'Durum Güncellensin mi?', icon: 'question', showCancelButton: true, confirmButtonText: 'Evet' });
        if (!result.isConfirmed) return;
    } else {
        if(!confirm('Durum değişsin mi?')) return;
    }
    await fetch('/api/atolye/siparis-durum-guncelle', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({satis_id: id, yeni_durum: st}) });
    loadSiparisler();
}

function setTitle(t) { document.getElementById('page-title').textContent = t; }
function setTableHead(h) { document.getElementById('table-head').innerHTML = `<tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>`; document.getElementById('table-body').innerHTML = '<tr><td colspan="10" class="text-center">Yükleniyor...</td></tr>'; }
function showError(err) { console.error(err); document.getElementById('table-body').innerHTML = `<tr><td colspan="10" class="text-danger text-center">Hata: ${err.message}</td></tr>`; }
