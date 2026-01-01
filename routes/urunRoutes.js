import express from "express";
import pool from "../config/db.js";
import { getUrunDetay, getBenzerUrunler, urunAra } from "../controllers/urunController.js";

const router = express.Router();

router.get("/vitrin", async (req, res) => {
  try {
    const query = `
      SELECT u.model_id, u.model_ad, u.satis_fiyat,
             (SELECT path FROM photos p WHERE p.model_id = u.model_id LIMIT 1) as resim
      FROM urunler u
      ORDER BY u.satis_fiyat DESC
      LIMIT 10
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Vitrin yüklenemedi" });
  }
});
router.get("/benzer", getBenzerUrunler);


router.get("/:id", getUrunDetay);


router.get("/", async (req, res) => {
  try {
    let sql = `
      SELECT u.*, 
      (SELECT path FROM photos p WHERE p.model_id = u.model_id LIMIT 1) as resim 
      FROM urunler u 
      WHERE 1=1
    `;
    
    const params = [];

    if (req.query.kategori) {
      sql += " AND u.kategori_id = ?";
      params.push(req.query.kategori);
    }
    if (req.query.renk) {
      sql += " AND u.renk_adi = ?";
      params.push(req.query.renk);
    }
    if (req.query.minFiyat) {
      sql += " AND u.satis_fiyat >= ?";
      params.push(req.query.minFiyat);
    }
    if (req.query.maxFiyat) {
      sql += " AND u.satis_fiyat <= ?";
      params.push(req.query.maxFiyat);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ürünler listelenemedi" });
  }
});

export default router;
