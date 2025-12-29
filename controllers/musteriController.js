// controllers/musteriController.js
import pool from "../config/db.js";

export const getFavorilerim = async (req, res) => {
    const { tel } = req.query; // Frontend'den gelen telefon numarası
    try {
        const sql = `
            SELECT 
                f.id AS favori_id, 
                u.model_id,
                u.model_ad, 
                u.satis_fiyat, 
                p.filename AS resim_url 
            FROM favoriler f
            JOIN urunler u ON f.model_id = u.model_id
            LEFT JOIN photos p ON u.model_id = p.model_id
            WHERE f.telefon = ?
            GROUP BY u.model_id`; // Birden fazla resim varsa çakışmayı önler

        const [rows] = await pool.query(sql, [tel]);
        res.json(rows);
    } catch (error) {
        console.error("Favori çekme hatası:", error);
        res.status(500).json({ hata: "Favoriler çekilemedi" });
    }
};

// Randevu İptal Rotası
export const randevuIptal = async (req, res) => {
    try {
        // Durumu 'İptal Edildi' yaparak yöneticinin ekranına düşmesini sağlarız
        await pool.query("UPDATE randevu SET onay_durumu = 'İptal Edildi' WHERE randevu_id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
};
// controllers/musteriController.js



// Bu fonksiyonun isminin 'getRandevularim' olduğundan emin ol
export const getRandevularim = async (req, res) => {
    const { tel } = req.query;
    try {
        // Senin tablonun sütun ismi: telefon_no
        const [rows] = await pool.query(
            "SELECT * FROM randevu WHERE telefon_no = ? ORDER BY randevu_tarih DESC", 
            [tel]
        );
        res.json(rows);
    } catch (err) {
        console.error("Randevu getirme hatası:", err);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
};

// Diğer exportların (getSiparislerim, getFavorilerim vb.) burada olduğundan emin ol

// controllers/musteriController.js içine ekle
export const postRandevuIslem = async (req, res) => {
    const { id } = req.params; // randevu_id
    const { durum } = req.body;
    try {
        await pool.query(
            "UPDATE randevu SET onay_durumu = ? WHERE randevu_id = ?", 
            [durum, id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Güncelleme hatası" });
    }
};

// 1. Siparişleri Getirme (Sütun isimlerini veritabanına göre kontrol et)
export const getSiparislerim = async (req, res) => {
    const { tel } = req.query;
    try {
        // Tablo isminiz 'satislar' veya 'magaza_satislar' ise burayı ona göre güncelleyin
        const [rows] = await pool.query("SELECT * FROM satislar WHERE telefon_no = ?", [tel]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Siparişler çekilemedi" });
    }
};

// controllers/musteriController.js

// Mevcut exportlarının altına bunu ekle:
export const toggleFavori = async (req, res) => {
    const { telefon_no, model_id } = req.body;
    try {
        // Önce bu ürün zaten favoride mi kontrol et
        const [existing] = await pool.query(
            "SELECT * FROM favoriler WHERE telefon = ? AND model_id = ?", 
            [telefon, model_id]
        );

        if (existing.length > 0) {
            // Varsa favoriden çıkar
            await pool.query(
                "DELETE FROM favoriler WHERE telefon = ? AND model_id = ?", 
                [telefon, model_id]
            );
            return res.json({ success: true, mesaj: "Favorilerden çıkarıldı" });
        } else {
            // Yoksa favoriye ekle
            await pool.query(
                "INSERT INTO favoriler (telefon, model_id) VALUES (?, ?)", 
                [telefon, model_id]
            );
            return res.json({ success: true, mesaj: "Favorilere eklendi" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Favori işlemi başarısız" });
    }
};