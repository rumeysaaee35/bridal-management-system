import pool from "../config/db.js";

export const satisSepettenEkle = async (req, res) => {
  try {
    const {
      kullanici_id,
      model_id,
      adet,
      birim_fiyat
    } = req.body || {};

    if (!kullanici_id || !model_id || !adet || !birim_fiyat) {
      return res.status(400).json({ error: "missing_fields" });
    }

    const toplam_tutar = Number(adet) * Number(birim_fiyat);

    const [result] = await pool.query(
      `
      INSERT INTO magaza_satislar
      (kullanici_id, model_id, adet, birim_fiyat, toplam_tutar, islem_turu)
      VALUES (?, ?, ?, ?, ?, 'online')
      `,
      [kullanici_id, model_id, adet, birim_fiyat, toplam_tutar]
    );

    res.status(201).json({
      success: true,
      satis_id: result.insertId
    });
  } catch (err) {
    console.error("satisSepettenEkle:", err);
    res.status(500).json({ error: "db_error" });
  }
};

