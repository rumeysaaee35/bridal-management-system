import pool from "../config/db.js";

export async function getDashboardOzet(req, res) {
  try {
    const secilenYil = req.query.yil || new Date().getFullYear(); 

    const [ozetRows] = await pool.query(`

        SELECT 
            CONCAT(musteri_ad, ' ', musteri_soyad) as musteri, 
            toplam_tutar, 
            islem_turu, 
            satis_tarihi,
            siparis_durumu 
        FROM magaza_satislar 
        ORDER BY satis_tarihi DESC 
        LIMIT 5
    `);

    const [gelirVerileri] = await pool.query(`
        SELECT ay, satis_geliri, kiralama_geliri, toplam_gelir
        FROM yillik_aylik_gelir
        WHERE yil = ?
        ORDER BY islem_id ASC 
    `, [secilenYil]);
    const [musteriVerileri] = await pool.query(`
        SELECT ay, musteri_sayisi
        FROM yillik_aylik_musteri
        WHERE yil = ?
        ORDER BY islem_id ASC
    `, [secilenYil]);

    const [yillar] = await pool.query(`
        SELECT DISTINCT yil FROM yillik_aylik_gelir ORDER BY yil DESC
    `);

    res.json({ 
        kartlar: {
            toplam_satis: ozetRows[0].toplam_satis || 0,
            toplam_kiralama: ozetRows[0].toplam_kiralama || 0,
            toplam_randevu: ozetRows[0].toplam_randevu || 0,
            kritik_stok: ozetRows[0].kritik_stok || 0,
            toplam_ciro: ozetRows[0].toplam_ciro || 0
        },
        tablo: sonHareketler,
        
        gelir_verileri: gelirVerileri,    
        musteri_verileri: musteriVerileri, 
        
        yillar: yillar.map(y => y.yil)
    });

  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: "Veri Hatası" }); 
  }
}
export async function getSatisListesi(req, res) {
  try {
    const query = `
      SELECT 
        m.satis_id, m.satis_tarihi, m.musteri_ad, m.musteri_soyad, 
        m.adet, m.toplam_tutar, m.islem_turu,
        u.model_ad 
      FROM magaza_satislar m
      LEFT JOIN urunler u ON m.model_id = u.model_id
      ORDER BY m.satis_tarihi DESC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("SATIŞ LİSTESİ HATASI:", err);
    res.json([]); 
  }
}

export async function getRandevuListesi(req, res) {
  try {
    const query = `
      SELECT 
        randevu_id, 
        musteri_ad, 
        musteri_soyad, 
        telefon_no,   -- 'telefon' olan yer 'telefon_no' olarak düzeltildi
        randevu_tarih,
        saat,         -- 'saat' sütunu eklendi
        onay_durumu,  -- 'onay_durumu' sütunu eklendi
        notlar        -- 'notlar' sütunu eklendi
      FROM randevu 
      ORDER BY randevu_tarih DESC, saat DESC
    `;
    
    const [rows] = await pool.query(query);
    
    res.json(rows);
  } catch (err) {
    console.error("RANDEVU LİSTESİ HATASI:", err);
    res.status(500).json({ error: "Veriler çekilemedi" }); 
  }
}

export async function getUrunlerBasit(req, res) {
    try {
        const [rows] = await pool.query("SELECT model_id, model_ad, satis_fiyat, kira_fiyat FROM urunler ORDER BY model_ad ASC");
        res.json(rows);
    } catch (err) {
        console.error("ÜRÜN LİSTESİ HATASI:", err);
        res.json([]);
    }
}

export async function magazaSatisEkle(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, islem_turu } = req.body;
    
    const toplam_tutar = Number(adet) * Number(birim_fiyat);

    await connection.query(`
      INSERT INTO magaza_satislar 
      (musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, toplam_tutar, islem_turu, satis_tarihi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, toplam_tutar, islem_turu]);

    if (islem_turu === 'satis') {
        const [stokVarMi] = await connection.query("SELECT * FROM adet WHERE model_id = ?", [model_id]);
        
        if (stokVarMi.length > 0) {
            await connection.query("UPDATE adet SET urun_adet = urun_adet - ? WHERE model_id = ?", [adet, model_id]);
        } else {
            console.warn("Bu ürün için stok tablosunda kayıt yok, stok düşülemedi.");
        }
    }

    await connection.commit();
    res.json({ success: true, message: "İşlem başarıyla kaydedildi." });

  } catch (err) {
    await connection.rollback();
    console.error("SATIŞ EKLEME HATASI:", err);
    res.status(500).json({ success: false, message: "Veritabanı hatası" });
  } finally {
    connection.release();
  }
}

export async function getStokDurumu(req, res) {
  try {
    const query = `
      SELECT 
        u.model_ad, 
        COALESCE(a.urun_adet, 0) as stok,
        COALESCE(a.kritik_adet_stok, 3) as kritik_sinir
      FROM urunler u
      LEFT JOIN adet a ON u.model_id = a.model_id
      ORDER BY a.urun_adet ASC
    `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("STOK SORGUSU HATASI:", err);
    res.json([]);
  }
}
