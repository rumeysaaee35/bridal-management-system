document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('cardModal');
    const kartRadio = document.getElementById('kart');
    const closeBtn = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveCardBtn');
    const cardNumberInput = document.getElementById('db-card-number');

    if (kartRadio) {
        kartRadio.addEventListener('click', function() {
            modal.style.display = 'flex';
        });
    }
    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }
    if (saveBtn) {
        saveBtn.onclick = function() {
            modal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
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
        window.location.href = 'siparis_onay.html';
    });
}
