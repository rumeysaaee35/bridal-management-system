import express from "express";
import { getDoluSaatler, createRandevu } from "../controllers/randevuController.js";

const router = express.Router();

router.get("/dolu-saatler", 
router.post("/olustur", createRandevu);


export default router;
router.post("/olustur", async (req, res) => {
    const { musteri_ad, musteri_soyad, musteriMail, telefon_no, randevu_tarih, saat, notlar } = req.body;

    try {
        const sql = `INSERT INTO randevu 
            (musteri_ad, musteri_soyad, musteriMail, telefon_no, randevu_tarih, saat, notlar, onay_durumu) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'Bekliyor')`;

        await pool.query(sql, [musteri_ad, musteri_soyad, musteriMail, telefon_no, randevu_tarih, saat, notlar]);
        res.status(200).json({ success: true, message: "Randevu başarıyla oluşturuldu." });
    } catch (err) {
        console.error("VERİTABANI HATASI:", err);
        res.status(500).json({ error: "Veritabanı yazma hatası" });
    }
});
