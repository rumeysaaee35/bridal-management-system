import pool from "../config/db.js";

/* ==================================================
   1. DASHBOARD KARTLARI VE GRAFİKLER (GÜNCELLENDİ 🚀)
   ================================================== */
/* ==================================================
   1. DASHBOARD KARTLARI VE DETAYLI ANALİZ (GÜNCELLENDİ 🚀)
   ================================================== */
// --- DASHBOARD: FİLTRELİ VERİ GETİRME ---
export async function getDashboardOzet(req, res) {
  try {
    // 1. Seçilen Yılı Al (Varsayılan: Bu yıl)
    const secilenYil = req.query.yil || new Date().getFullYear(); 

    // 2. KARTLAR (Genel Durum - Anlık Veri)
    // Kartlar anlık olduğu için ana tablodan saymaya devam ediyoruz
    // ... (Üst kısımlar aynı)
    const [ozetRows] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM magaza_satislar WHERE islem_turu='satis') AS toplam_satis,
        (SELECT COUNT(*) FROM magaza_satislar WHERE islem_turu='kiralama') AS toplam_kiralama,
        (SELECT COUNT(*) FROM randevu) AS toplam_randevu,
        
        -- DÜZELTİLEN MANTIK BURASI 👇
        -- Sabit < 3 yerine, her ürünün kendi 'kritik_adet_stok' değerine bakıyoruz.
        -- Eğer sınır girilmemişse (NULL ise) varsayılan olarak 3 kabul etsin.
        (SELECT COUNT(*) FROM adet 
         WHERE urun_adet < COALESCE(kritik_adet_stok, 3)) AS kritik_stok,
         
        (SELECT SUM(toplam_tutar) FROM magaza_satislar) AS toplam_ciro
    `);
// ... (Alt kısımlar aynı)

    // 3. SON İŞLEMLER LİSTESİ
const [sonHareketler] = await pool.query(`
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

    // --- GRAFİK VERİLERİ (SENİN TABLOLARINDAN) ---

    // 4. GELİR VERİLERİ (Ciro Grafiği ve Pasta Grafik İçin)
    // 'yillik_aylik_gelir' tablosundan o yıla ait verileri çekiyoruz
    const [gelirVerileri] = await pool.query(`
        SELECT ay, satis_geliri, kiralama_geliri, toplam_gelir
        FROM yillik_aylik_gelir
        WHERE yil = ?
        ORDER BY islem_id ASC  -- Ayların sırasını korumak için ID'ye göre sıraladık
    `, [secilenYil]);

    // 5. MÜŞTERİ MEVSİMSELLİĞİ
    // 'yillik_aylik_musteri' tablosundan o yıla ait müşteri sayıları
    const [musteriVerileri] = await pool.query(`
        SELECT ay, musteri_sayisi
        FROM yillik_aylik_musteri
        WHERE yil = ?
        ORDER BY islem_id ASC
    `, [secilenYil]);

    // 6. YILLAR LİSTESİ (Filtre kutusunu doldurmak için)
    const [yillar] = await pool.query(`
        SELECT DISTINCT yil FROM yillik_aylik_gelir ORDER BY yil DESC
    `);

    // Hepsini Paketi Gönder
    res.json({ 
        kartlar: {
            toplam_satis: ozetRows[0].toplam_satis || 0,
            toplam_kiralama: ozetRows[0].toplam_kiralama || 0,
            toplam_randevu: ozetRows[0].toplam_randevu || 0,
            kritik_stok: ozetRows[0].kritik_stok || 0,
            toplam_ciro: ozetRows[0].toplam_ciro || 0
        },
        tablo: sonHareketler,
        
        // Yeni tablolardan gelen veriler:
        gelir_verileri: gelirVerileri,     // İçinde hem toplam, hem satış, hem kira var
        musteri_verileri: musteriVerileri, // İçinde ay ve müşteri sayısı var
        
        yillar: yillar.map(y => y.yil)
    });

  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: "Veri Hatası" }); 
  }
}
/* ==================================================
   2. SATIŞ ANALİZİ (Tablo Verisi)
   ================================================== */
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

/* ==================================================
   3. RANDEVU LİSTESİ
   ================================================== */
/* ==================================================
   3. RANDEVU LİSTESİ (GÜNCELLENDİ ✅)
   ================================================== */
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
    
    // Veritabanından gelen verileri doğrudan gönderiyoruz
    res.json(rows);
  } catch (err) {
    console.error("RANDEVU LİSTESİ HATASI:", err);
    res.status(500).json({ error: "Veriler çekilemedi" }); 
  }
}

/* ==================================================
   4. ÜRÜN LİSTESİ (Select Kutusu İçin)
   ================================================== */
export async function getUrunlerBasit(req, res) {
    try {
        const [rows] = await pool.query("SELECT model_id, model_ad, satis_fiyat, kira_fiyat FROM urunler ORDER BY model_ad ASC");
        res.json(rows);
    } catch (err) {
        console.error("ÜRÜN LİSTESİ HATASI:", err);
        res.json([]);
    }
}

/* ==================================================
   5. YENİ SATIŞ EKLEME (Stok Düşmeli)
   ================================================== */
export async function magazaSatisEkle(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, islem_turu } = req.body;
    
    const toplam_tutar = Number(adet) * Number(birim_fiyat);

    // 1. Satışı Kaydet
    await connection.query(`
      INSERT INTO magaza_satislar 
      (musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, toplam_tutar, islem_turu, satis_tarihi)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [musteri_ad, musteri_soyad, telefon_no, model_id, adet, birim_fiyat, toplam_tutar, islem_turu]);

    // 2. Stok Düş
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

/* ==================================================
   6. STOK LİSTESİ VE GRAFİK VERİSİ
   ================================================== */
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