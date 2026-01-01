import pool from "../config/db.js";


import * as Urun from "../models/Urun.js";

export async function stokDurumu(req, res) {
  try {
    const list = await Urun.getStokDurumu();
    const critical = list.filter(
      r => r.urun_adet <= r.kritik_stok_adet
    );
    res.json({ list, critical });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function kiraSatisTop(req, res) {
  try {
    const data = await Urun.getKiraSatisTop();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function urunByAd(req, res) {
  try {
    const product = await Urun.getUrunByAd(req.query.model_ad);
    if (!product)
      return res.status(404).json({ error: "Ürün bulunamadı" });
    res.json({ product });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export const getUrunler = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        u.*,
        (
          SELECT p.path
          FROM photos p
          WHERE p.model_id = u.model_id
          ORDER BY p.id ASC
          LIMIT 1
        ) AS kapak_foto
      FROM urunler u
    `);

    res.json(rows);
  } catch (err) {
    console.error("Ürünler alınamadı:", err);
    res.status(500).json({ error: "Ürünler alınamadı" });
  }
};

export const getUrunById = async (req, res) => {
  try {
    const { id } = req.params;

    const [urunRows] = await pool.query(
      "SELECT * FROM urunler WHERE model_id = ?",
      [id]
    );

    if (!urunRows.length) {
      return res.status(404).json({ error: "Ürün bulunamadı" });
    }

    const urun = urunRows[0];

    const [photos] = await pool.query(
      "SELECT path FROM photos WHERE model_id = ? ORDER BY id ASC",
      [id]
    );

    res.json({
      ...urun,
      fotolar: photos.map(p =>
        p.path.startsWith("/") ? p.path : "/" + p.path
      )
    });

  } catch (err) {
    console.error("TEK ÜRÜN HATASI:", err);
    res.status(500).json({ error: err.message });
  }
};


export async function getUrunDetay(req, res) {
  const { id } = req.params;
  try {
    // Ürün bilgilerini çek
    const [urun] = await pool.query("SELECT * FROM urunler WHERE model_id = ?", [id]);
    
    if (urun.length === 0) return res.status(404).json({ error: "Ürün bulunamadı" });

    const [fotolar] = await pool.query("SELECT path FROM photos WHERE model_id = ?", [id]);

    res.json({
        ...urun[0],
        fotolar: fotolar.map(f => f.path) 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Detay hatası" });
  }
}

export async function getBenzerUrunler(req, res) {
    const { id, renk, fiyat } = req.query;
    try {
        const query = `
            SELECT model_id, model_ad, satis_fiyat, 
            (SELECT path FROM photos WHERE model_id = urunler.model_id LIMIT 1) as resim
            FROM urunler 
            WHERE model_id != ? 
            AND (renk_adi = ? OR satis_fiyat BETWEEN ? AND ?)
            LIMIT 5
        `;
        const minFiyat = Number(fiyat) * 0.8;
        const maxFiyat = Number(fiyat) * 1.2;

        const [rows] = await pool.query(query, [id, renk, minFiyat, maxFiyat]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Benzer ürün hatası" });
    }
}


export const urunAra = async (req, res) => {
    const { q } = req.query; // Arama kelimesi
    try {
        const sql = `
            SELECT model_id, model_ad, satis_fiyat, ana_resim 
            FROM urunler 
            WHERE model_ad LIKE ? OR kategori LIKE ? 
            LIMIT 5`;
        const [rows] = await pool.query(sql, [`%${q}%`, `%${q}%`]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Arama sırasında hata oluştu" });
    }
};
