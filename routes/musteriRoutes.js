import express from "express";
import { getSiparislerim, getRandevularim, getFavorilerim, toggleFavori } from "../controllers/musteriController.js";

const router = express.Router();

router.get("/siparisler", getSiparislerim);
router.get("/randevular", getRandevularim);
router.get("/favoriler", getFavorilerim);
router.post("/favori-islem", toggleFavori);

router.get("/randevularim", async (req, res) => {
    const { tel } = req.query;
    try {
        const [rows] = await pool.query(
            "SELECT * FROM randevu WHERE telefon = ? ORDER BY randevu_tarih DESC", 
            [tel]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Veritabanı hatası" });
    }
});

router.post("/randevu-islem/:id", async (req, res) => {
    const { id } = req.params;
    const { durum } = req.body;
    try {
        await pool.query(
            "UPDATE randevu SET onay_durumu = ? WHERE randevu_id = ?", 
            [durum, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Güncelleme hatası" });
    }
});

export default router;
