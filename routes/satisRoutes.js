import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.post("/ekle", async (req, res) => {
  const { user_id, sepet } = req.body;

  if (!sepet || sepet.length === 0) {
    return res.status(400).json({ success: false, message: "Sepet boş!" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); 

    for (const urun of sepet) {
      const query = `
        INSERT INTO satislar (user_id, model_id, adet, birim_fiyat, toplam_tutar, satis_tarihi)
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      await connection.query(query, [
        user_id, 
        urun.model_id, 
        urun.adet, 
        urun.fiyat, 
        urun.adet * urun.fiyat
      ]);
    }

    await connection.commit(); 
    res.json({ success: true, message: "Siparişiniz alındı!" });

  } catch (err) {
    await connection.rollback(); 
    console.error("Satış Hatası:", err);
    res.status(500).json({ success: false, message: "Satış işlemi başarısız." });
  } finally {
    connection.release();
  }
});

router.get("/", async (req, res) => {
  try {
    const query = `
      SELECT s.*, u.model_ad, k.ad as musteri_ad, k.soyad as musteri_soyad
      FROM satislar s
      JOIN urunler u ON s.model_id = u.model_id
      JOIN kullanicilar k ON s.user_id = k.kullanici_id
      ORDER BY s.satis_tarihi DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Satışlar çekilemedi." });
  }
});

export default router;
