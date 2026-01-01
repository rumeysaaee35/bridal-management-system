import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tablo adı: 'kullanicilar'
    const [users] = await pool.query(
      "SELECT * FROM kullanicilar WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Kullanıcı bulunamadı!" });
    }

    const user = users[0];

    if (password != user.sifre) {
      return res.status(401).json({ success: false, message: "Hatalı şifre!" });
    }

    // Giriş Başarılı
    res.json({
      success: true,
      message: "Giriş başarılı",
      user: {
        id: user.kullanici_id,
        ad: user.ad,
        soyad: user.soyad,
        role: user.role
      }
    });

  } catch (err) {
    console.error("Login Hatası:", err);
    res.status(500).json({ success: false, message: "Sunucu hatası!" });
  }
});

router.post("/register", async (req, res) => {
  const { ad, soyad, email, password } = req.body;

  if (!ad || !soyad || !email || !password) {
    return res.status(400).json({ success: false, message: "Tüm alanları doldurun!" });
  }

  try {
    const [existingUser] = await pool.query("SELECT * FROM kullanicilar WHERE email = ?", [email]);
    
    if (existingUser.length > 0) {
      return res.status(409).json({ success: false, message: "Bu e-posta zaten kayıtlı." });
    }
.
    const [result] = await pool.query(
      "INSERT INTO kullanicilar (ad, soyad, email, sifre, role) VALUES (?, ?, ?, ?, ?)",
      [ad, soyad, email, password, 'musteri']
    );

    res.status(201).json({ 
      success: true, 
      message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." 
    });

  } catch (err) {
    console.error("Kayıt Hatası:", err);
    res.status(500).json({ success: false, message: "Kayıt sırasında hata oluştu." });
  }
});

router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    
    try {
        const [users] = await pool.query("SELECT * FROM kullanicilar WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "Bu e-posta ile kayıtlı kullanıcı yok." });
        }

        res.json({ success: true, message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (Simülasyon)." });

    } catch (err) {
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
});

export default router;
