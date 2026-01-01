
const params = new URLSearchParams(window.location.search);
const gelenModel = params.get("model");

document.addEventListener("DOMContentLoaded", () => {
    const modelText = gelenModel ? gelenModel : "Gelinlik";
    document.getElementById("selectedModelName").innerText = modelText;

    const bugun = new Date().toISOString().split("T")[0];
    document.getElementById("tarih").setAttribute("min", bugun);

    document.getElementById("tarih").addEventListener("change", saatleriGetir);
});
async function saatleriGetir() {
    const tarih = document.getElementById("tarih").value;
    const timeContainer = document.getElementById("timeSlots");
    const loading = document.getElementById("loadingTimes");

    if (!tarih) return;

    timeContainer.innerHTML = "";
    loading.style.display = "block";

    try {
        const res = await fetch(`/api/randevular/dolu-saatler?tarih=${tarih}`);
        const doluSaatler = await res.json(); // Örn: ["14:00:00", "09:00:00"]
        
        loading.style.display = "none";
        const baslangic = 9;
        const bitis = 18;

        for (let i = baslangic; i <= bitis; i++) {
            const saatStr = (i < 10 ? "0" + i : i) + ":00";
            const isDolu = doluSaatler.some(ds => ds.startsWith(saatStr));

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "time-btn";
            btn.innerText = saatStr;
            
            if (isDolu) {
                btn.disabled = true;
                btn.title = "Bu saat dolu";
            } else {
                btn.onclick = () => saatSec(saatStr, btn);
            }

            timeContainer.appendChild(btn);
        }

    } catch (err) {
        console.error(err);
        loading.innerText = "Saatler yüklenirken hata oluştu.";
    }
}
function saatSec(saat, btnElement) {
    document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
    

    btnElement.classList.add("selected");
    document.getElementById("secilenSaat").value = saat;
}
async function randevuKaydet(e) {
    e.preventDefault();

    const saat = document.getElementById("secilenSaat").value;
    if (!saat) {
        alert("Lütfen uygun bir saat seçiniz!");
        return;
    }

    const payload = {
        ad: document.getElementById("ad").value,
        soyad: document.getElementById("soyad").value,
        telefon: document.getElementById("telefon").value,
        email: document.getElementById("email").value,
        tarih: document.getElementById("tarih").value,
        saat: saat,
        model: document.getElementById("selectedModelName").innerText
    };

    try {
        const res = await fetch("/api/randevular/olustur", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message); // "Randevu talebiniz alındı..."
            window.location.href = "/index.html";
        } else {
            alert("Hata: " + data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Bir hata oluştu.");
    }
}
