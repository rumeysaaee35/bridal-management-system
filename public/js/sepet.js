document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});

// SEPETİ YÜKLE
function loadCart() {
    const sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    const tbody = document.getElementById("cartTableBody");
    const emptyMsg = document.getElementById("emptyCartMessage");
    const cartContent = document.getElementById("cartContent");
    const summaryBox = document.getElementById("cartSummaryBox");

    if (sepet.length === 0) {
        cartContent.style.display = "none";
        summaryBox.style.display = "none";
        emptyMsg.classList.remove("hidden");
        emptyMsg.style.display = "block";
        return;
    }

    cartContent.style.display = "block";
    summaryBox.style.display = "block";
    emptyMsg.style.display = "none";
    
    tbody.innerHTML = "";
    let toplamTutar = 0;

    sepet.forEach((item, index) => {
        const satirToplam = item.fiyat * item.adet;
        toplamTutar += satirToplam;

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="item-info">
                        <img src="${item.resim}" alt="${item.ad}">
                        <div class="item-details">
                            <h4>${item.ad}</h4>
                            <span>Beden: ${item.beden}</span>
                        </div>
                    </div>
                </td>
                <td>${item.fiyat} ₺</td>
                <td>
                   <div style="border:1px solid #ddd; display:inline-flex; align-items:center;">
                        <button onclick="adetDegistir(${index}, -1)" style="padding:5px 10px; border:none; background:none; cursor:pointer">-</button>
                        <span style="padding:0 10px">${item.adet}</span>
                        <button onclick="adetDegistir(${index}, 1)" style="padding:5px 10px; border:none; background:none; cursor:pointer">+</button>
                   </div>
                </td>
                <td><strong>${satirToplam} ₺</strong></td>
                <td>
                    <button class="remove-btn" onclick="urunuSil(${index})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    document.getElementById("subTotal").innerText = toplamTutar + " ₺";
    document.getElementById("grandTotal").innerText = toplamTutar + " ₺";
}

// ADET DEĞİŞTİRME
window.adetDegistir = function(index, miktar) {
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    
    sepet[index].adet += miktar;
    
    if(sepet[index].adet < 1) sepet[index].adet = 1; // En az 1 olsun
    
    localStorage.setItem("sepet", JSON.stringify(sepet));
    loadCart();
}

// ÜRÜN SİLME
window.urunuSil = function(index) {
    let sepet = JSON.parse(localStorage.getItem("sepet")) || [];
    sepet.splice(index, 1); // Listeden sil
    localStorage.setItem("sepet", JSON.stringify(sepet));
    loadCart(); // Tekrar yükle
    
    // Header'daki sepet ikonunu güncellemek için sayfa yenilemesi yerine event atılabilir ama şimdilik basit kalsın
    window.location.reload(); 
}

// SİPARİŞİ TAMAMLA (Backend'e Gönder)
window.siparisiTamamla = async function() {
    const sepet = JSON.parse(localStorage.getItem("sepet")) || [];

    if(sepet.length === 0) {
        alert("Sepetiniz boş!");
        return;
    }

    // 1. ADRES BİLGİLERİ
    const ad = document.getElementById("musteriAd").value;
    const soyad = document.getElementById("musteriSoyad").value;
    const tel = document.getElementById("musteriTel").value;
    const adres = document.getElementById("musteriAdres").value;

    // 2. KART BİLGİLERİ (YENİ)
    const kartIsim = document.getElementById("kartIsim").value;
    const kartNo = document.getElementById("kartNo").value;
    const kartAy = document.getElementById("kartAy").value;
    const kartYil = document.getElementById("kartYil").value;
    const kartCvv = document.getElementById("kartCvv").value;

    // 3. KONTROL (Validasyon)
    if(!ad || !soyad || !tel || !adres) {
        alert("Lütfen teslimat bilgilerini eksiksiz doldurun.");
        return;
    }
    if(!kartIsim || kartNo.length < 15 || !kartAy || !kartYil || !kartCvv) {
        alert("Lütfen kredi kartı bilgilerinizi kontrol ediniz.");
        return;
    }

    // ... BURADAN SONRASI AYNI (FETCH KISMI) ...
    const payload = {
        musteri_ad: ad,
        musteri_soyad: soyad,
        telefon: tel,
        adres: adres,
        urunler: sepet 
        // NOT: Kart bilgilerini güvenlik gereği veritabanına kaydetmiyoruz,
        // sadece ödeme alınmış gibi işlem yapıyoruz.
    };

    try {
        const res = await fetch("/api/sepet/satin-al", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if(result.success) {
            alert("Ödeme Başarılı! " + result.message);
            localStorage.removeItem("sepet");
            window.location.href = "index.html";
        } else {
            alert("Hata: " + result.message);
        }

    } catch (err) {
        console.error("Sipariş hatası:", err);
        alert("Sipariş oluşturulamadı.");
    }
}

// KART NUMARASINI 4'ERLİ AYIRAN FONKSİYON
function formatCardNumber(input) {
    // Sadece rakamları al
    let val = input.value.replace(/\D/g, '');
    // 4 karakterde bir boşluk ekle
    let newVal = '';
    for(let i = 0; i < val.length; i++) {
        if(i > 0 && i % 4 === 0) {
            newVal += ' ';
        }
        newVal += val[i];
    }
    input.value = newVal;
}