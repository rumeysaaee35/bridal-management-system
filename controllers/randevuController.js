import pool from "../config/db.js";

export async function getDoluSaatler(req, res) {
    const { tarih } = req.query; 
    try {
        const [rows] = await pool.query(
            "SELECT saat FROM randevu WHERE randevu_tarih = ?", 
            [tarih]
        );
        const doluSaatler = rows.map(row => row.saat);
        res.json(doluSaatler);
    } catch (err) {
        console.error("Saat sorgusu hatası:", err);
        res.status(500).json({ error: "Saatler alınamadı" });
    }
}
export async function createRandevu(req, res) {
    const { ad, soyad, telefon_no, email, tarih, saat } = req.body;

    try {
        const [kontrol] = await pool.query(
            "SELECT * FROM randevu WHERE randevu_tarih = ? AND saat = ?",
            [tarih, saat]
        );

        if (kontrol.length > 0) {
            return res.status(400).json({ success: false, message: "Bu saat maalesef az önce doldu!" });
        }

        await pool.query(
            `INSERT INTO randevu (musteri_ad, musteri_soyad, telefon_no, musteriMail, randevu_tarih, saat) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [ad, soyad, telefon_no, email, tarih, saat]
        );

        res.json({ success: true, message: "Randevu talebiniz alındı! Onay için sizi arayacağız." });

    } catch (err) {
        console.error("Randevu kayıt hatası:", err);
        res.status(500).json({ success: false, message: "Veritabanı hatası oluştu." });
    }
}
