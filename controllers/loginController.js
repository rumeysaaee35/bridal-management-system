import pool from "../config/db.js";

export async function register(req, res) {
    const { ad, soyad, email, telefon, sifre } = req.body;

    try {
        const [varMi] = await pool.query(
            "SELECT * FROM kullanicilar WHERE telefon = ? OR email = ?", 
            [telefon, email]
        );
        
        if (varMi.length > 0) {
            return res.status(400).json({ success: false, message: "Bu telefon veya E-Posta zaten sistemde kayıtlı!" });
        }

        const query = `
            INSERT INTO kullanicilar (ad, soyad, email, telefon, sifre) 
            VALUES (?, ?, ?, ?, ?)
        `;
        
        await pool.query(query, [ad, soyad, email, telefon, sifre]);

        res.json({ success: true, message: "Kayıt başarılı! Şimdi giriş yapabilirsiniz." });

    } catch (err) {
        console.error("Kayıt hatası:", err);
        res.status(500).json({ success: false, message: "Kayıt olurken veritabanı hatası oluştu." });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;

    try {
        console.log("Login isteği geldi:", email);
        const [users] = await pool.query(
            "SELECT * FROM kullanicilar WHERE email = ? AND sifre = ?", 
            [email, password]
        );

        if (users.length > 0) {
            const user = users[0];
            
            res.json({ 
                success: true, 
                user: { 
                    id: user.kullanici_id,
                    ad: user.ad, 
                    soyad: user.soyad,
                    email: user.email,
                    role: user.rol || 'user' 
                } 
            });
        } else {
            res.status(401).json({ success: false, message: "E-Posta adresi veya şifre yanlış!" });
        }

    } catch (err) {
        console.error("Login hatası:", err);
        res.status(500).json({ success: false, message: "Giriş işlemi sırasında hata oluştu." });
    }
}
