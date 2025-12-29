
console.log(">>> URUN MODEL YÜKLENDİ <<<");


import pool from "../config/db.js";

/* =========================
   MÜŞTERİ MAĞAZASI – TÜM ÜRÜNLER
========================= */
export async function getAllUrunler() {
  const [rows] = await pool.query(`
    SELECT 
      u.model_id,
      u.model_ad,
      u.aciklama,
      u.kira_fiyat,
      u.satis_fiyat,
      LEFT JOIN photos p 
  ON p.model_id = u.model_id
 AND p.id = (
   SELECT MIN(id) FROM photos WHERE model_id = u.model_id
 )

    FROM urunler u
    LEFT JOIN photos p
      ON p.model_id = u.model_id
    GROUP BY 
      u.model_id,
      u.model_ad,
      u.aciklama,
      u.kira_fiyat,
      u.satis_fiyat
  `);

  return rows;
}
