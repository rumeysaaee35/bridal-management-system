
import pool from "../config/db.js";

export const getFavorilerim = async (req, res) => {
    const { tel } = req.query;
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
            GROUP BY u.model_id`;

        const [rows] = await pool.query(sql, [tel]);
        res.json(rows);
    } catch (error) {
        console.error("Favori çekme hatası:", error);
        res.status(500).json({ hata: "Favoriler çekilemedi" });
    }
};

export const randevuIptal = async (req, res) => {
    try {
        await pool.query("UPDATE randevu SET onay_durumu = 'İptal Edildi' WHERE randevu_id = ?", [req.params.id]);
        res.json({ success: true });
    } catch (e) { res.status(500).json(e); }
};



export const getRandevularim = async (req, res) => {
    const { tel } = req.query;
    try {
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

export const getSiparislerim = async (req, res) => {
    const { tel } = req.query;
    try {
        const [rows] = await pool.query("SELECT * FROM satislar WHERE telefon_no = ?", [tel]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Siparişler çekilemedi" });
    }
};

export const toggleFavori = async (req, res) => {
    const { telefon_no, model_id } = req.body;
    try {
        const [existing] = await pool.query(
            "SELECT * FROM favoriler WHERE telefon = ? AND model_id = ?", 
            [telefon, model_id]
        );

        if (existing.length > 0) {
            await pool.query(
                "DELETE FROM favoriler WHERE telefon = ? AND model_id = ?", 
                [telefon, model_id]
            );
            return res.json({ success: true, mesaj: "Favorilerden çıkarıldı" });
        } else {
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
