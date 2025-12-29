// public/js/login.js

// ==========================================
// 1. POP-UP VE GÖRÜNÜM AYARLARI
// ==========================================

document.addEventListener('click', function(e) {
    // Header'daki ikon tıklaması (Giriş yap butonu)
    if (e.target.closest('#login-btn')) {
        e.preventDefault();
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.remove('hidden');
    }
    // Kapatma düğmeleri (X ikonu veya dış boşluk)
    if (e.target.id === 'closeLogin' || e.target.classList.contains('close-modal') || e.target.id === 'loginModal') {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.add('hidden');
    }
});

// Pencere geçişleri (Kayıt ol / Giriş yap arası)
window.showRegister = function() {
    document.getElementById('loginBox').classList.add('hidden');
    document.getElementById('registerBox').classList.remove('hidden');
}

window.showLogin = function() {
    document.getElementById('registerBox').classList.add('hidden');
    // DÜZELTME: Burası 'loinBox' yazılmıştı, 'loginBox' olmalı
    document.getElementById('loginBox').classList.remove('hidden');
}

// ==========================================
// 2. 🚀 ANA LOGIN FONKSİYONU (DÜZELTİLDİ)
// ==========================================
window.login = async function() {
    console.log("Login butonuna basıldı!"); 
    
    const emailEl = document.getElementById("loginEmail");
    const passEl = document.getElementById("loginPassword");

    if (!emailEl || !passEl) {
        alert("HATA: Inputlar bulunamadı! HTML id'lerini kontrol et.");
        return;
    }

    const email = emailEl.value;
    const password = passEl.value;

    if (!email || !password) {
        alert("Lütfen e-posta ve şifrenizi girin.");
        return;
    }

    try {
        // DÜZELTME 1: Port 8081 ve yol /api/auth/login olmalı
        // server.js: app.use("/api/auth", authRoutes);
        // authRoutes.js: router.post("/login", ...);
        const apiUrl = "http://localhost:8081/api/auth/login"; 
        
        console.log("İstek atılıyor:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        // Backend'den gelen cevabı (başarılı veya hatalı) al
        const data = await response.json();

        if (response.ok && data.success) {
            // --- GİRİŞ BAŞARILI ---
            alert("Giriş Başarılı! Yönlendiriliyorsunuz...");
            
            // Kullanıcıyı tarayıcı hafızasına kaydet
            localStorage.setItem("user", JSON.stringify(data.user));

            // Role göre yönlendirme
            if (data.user.role === 'admin' || data.user.role === 'yonetici') {
                window.location.href = "/yonetici.html";
            } else if (data.user.role === 'atolye') {
                window.location.href = "/atolye.html";
            } else {
                window.location.href = "/index.html";
            }
        } else {
            // --- GİRİŞ BAŞARISIZ (Şifre yanlış vs.) ---
            // Backend'den gelen mesajı göster (Örn: "Hatalı şifre!")
            alert("Giriş Başarısız: " + (data.message || "Bilinmeyen hata"));
        }

    } catch (error) {
        console.error("Login Hatası Detayı:", error);
        
        if (error.message.includes("Failed to fetch")) {
            alert("Sunucuyla iletişim kurulamadı! Backend (server.js) açık mı?");
        } else {
            alert("Bir hata oluştu: " + error.message);
        }
    }
};

// login.js en altına ekle:

// ==========================================
// 🚀 KAYIT OL (REGISTER) FONKSİYONU
// ==========================================
window.register = async function() {
    console.log("Kayıt ol butonuna basıldı.");

    // HTML'deki ID'lerin doğru olduğundan emin ol!
    // Örnek: <input id="regAd">, <input id="regEmail"> vb.
    const ad = document.getElementById("regAd")?.value;
    const soyad = document.getElementById("regSoyad")?.value;
    const email = document.getElementById("regEmail")?.value;
    const password = document.getElementById("regPassword")?.value;

    if (!ad || !soyad || !email || !password) {
        alert("Lütfen tüm alanları doldurun.");
        return;
    }

    try {
        const response = await fetch("http://localhost:8081/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ad, soyad, email, password })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert(data.message); // "Kayıt başarılı!"
            // Kayıt olduktan sonra otomatik olarak giriş ekranına geçirelim
            window.showLogin(); 
        } else {
            alert("Hata: " + data.message);
        }

    } catch (error) {
        console.error("Kayıt hatası:", error);
        alert("Sunucuya bağlanılamadı.");
    }
};

// ==========================================
// 🔒 ŞİFREMİ UNUTTUM FONKSİYONU
// ==========================================
window.forgotPassword = async function() {
    // Şifremi unuttum modalı veya prompt kullanabiliriz
    const email = prompt("Lütfen kayıtlı e-posta adresinizi girin:");
    
    if (!email) return;

    try {
        const response = await fetch("http://localhost:8081/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();
        alert(data.message);

    } catch (error) {
        alert("İşlem sırasında bir hata oluştu.");
    }
};

// js/login.js dosyasının EN ALTINA ekle:

