import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* FAVORİLERİ GETİR */
router.get("/:kullanici_id", async (req, res) => {
  const { kullanici_id } = req.params;

  try {
    const [rows] = await pool.query(`
      SELECT 
        u.model_id,
        u.model_ad,
        u.aciklama,
        u.kira_fiyat,
        u.satis_fiyat,
        MIN(p.path) AS path
      FROM favoriler f
      JOIN urunler u ON u.model_id = f.model_id
      LEFT JOIN photos p ON p.model_id = u.model_id
      WHERE f.kullanici_id = ?
      GROUP BY u.model_id
    `, [kullanici_id]);

    res.json(rows);
  } catch (err) {
    console.error("FAVORİLER GETİR HATASI:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
