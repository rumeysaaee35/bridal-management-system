document.addEventListener('DOMContentLoaded', function() {
    // Sayfa üzerindeki elemanları seçiyoruz
    const modal = document.getElementById('cardModal');
    const kartRadio = document.getElementById('kart');
    const closeBtn = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveCardBtn');
    const cardNumberInput = document.getElementById('db-card-number');

    // 1. POP-UP AÇMA: Radio butona tıklandığında modalı göster
    if (kartRadio) {
        kartRadio.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
    }

    // 2. KAPATMA: X butonuna basınca modalı gizle
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }

    // 3. ONAYLAMA: "Kartı Onayla" butonuna basınca modalı gizle
    if (saveBtn) {
        saveBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }

    // 4. DIŞARI TIKLAMA: Modalın dışındaki boşluğa basınca kapat
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // 5. KART MASKESİ: Rakam yazarken boşluk bırakma
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
            e.target.value = formattedValue.substring(0, 19);
        });
    }
});


if (finishOrderBtn) {
    finishOrderBtn.addEventListener('click', function() {
        // Burada normalde backend kontrolü olur ama biz direkt yönlendiriyoruz
        window.location.href = 'siparis_onay.html';
    });
}