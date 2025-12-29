import pool from '../config/db.js';

// --- 1. SAĞLIK KONTROLÜ ---
export const health = async (req, res) => {
    res.status(200).json({ message: "Atölye API çalışıyor." });
};

// --- 2. MODEL STOKLARI ---
export const getModelStoklari = async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.model_id,
                u.model_ad,
                u.renk_adi as renk,
                COALESCE(a.urun_adet, 0) as mevcut_adet,
                COALESCE(a.kritik_adet_stok, 5) as kritik_sinir
            FROM urunler u
            LEFT JOIN adet a ON u.model_id = a.model_id
            ORDER BY u.model_ad ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("STOK SQL HATASI:", error);
        res.status(500).json({ error: error.message, sqlMessage: error.sqlMessage });
    }
};

// --- 3. MAĞAZA SATIŞLARI ---
export const getMagazaSatislari = async (req, res) => {
    try {
        const sql = `
            SELECT 
                ms.satis_id,
                ms.satis_tarihi as tarih,
                CONCAT(ms.musteri_ad, ' ', ms.musteri_soyad) as musteri_ad,
                ms.beden,
                ms.adet,
                ms.islem_turu,
                ms.siparis_durumu,
                u.model_ad,
                u.renk_adi as renk
            FROM magaza_satislar ms
            LEFT JOIN urunler u ON ms.model_id = u.model_id
            ORDER BY ms.satis_tarihi DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("SATIŞ SQL HATASI:", error);
        res.status(500).json({ error: error.message, sqlMessage: error.sqlMessage });
    }
};

// --- 4. ÜRETİM LİSTESİ (Geçmiş Üretimler) ---
export const getUretimler = async (req, res) => {
    try {
        const sql = `
            SELECT 
                au.uretim_id, 
                au.uretim_tarihi, 
                au.uretim_adet, 
                u.model_ad, 
                u.renk_adi as renk
            FROM atolye_uretimleri au
            JOIN urunler u ON au.model_id = u.model_id
            ORDER BY au.uretim_tarihi DESC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("ÜRETİM HATASI:", error);
        res.status(500).json({ error: error.message });
    }
};

// --- 5. YENİ ÜRETİM EKLE ---
export const addUretim = async (req, res) => {
    const { model_id, adet, tarih } = req.body;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('INSERT INTO atolye_uretimleri (model_id, uretim_adet, uretim_tarihi) VALUES (?, ?, ?)', [model_id, adet, tarih]);
        
        const [varMi] = await connection.query('SELECT * FROM adet WHERE model_id = ?', [model_id]);
        if (varMi.length > 0) {
            await connection.query('UPDATE adet SET urun_adet = urun_adet + ? WHERE model_id = ?', [adet, model_id]);
        } else {
            await connection.query('INSERT INTO adet (model_id, urun_adet) VALUES (?, ?)', [model_id, adet]);
        }
        await connection.commit();
        res.json({ message: "Kayıt başarılı" });
    } catch (e) { await connection.rollback(); res.status(500).json({error: e.message}); } finally { connection.release(); }
};

// --- 6. HAMMADDE ANALİZİ (GEREKLİ vs STOKTAKİ) ---
// --- 6. HAMMADDE ANALİZİ (DÜZELTİLMİŞ) ---
// --- 6. HAMMADDE ANALİZİ (GÜNCELLENMİŞ VE DÜZELTİLMİŞ) ---
export const getMalzemeGiderleri = async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.model_ad,
                u.renk_adi as model_renk,
                
                -- DÜZELTME BURADA:
                -- hammadde_ad ve birim bilgisi 'hammaddeler' (h) tablosundan geliyor
                h.hammadde_ad, 
                h.birim,
                
                -- Renk ve Stok bilgisi 'hammadde_stok' (hs) tablosundan geliyor
                hs.renk as hammadde_renk,
                hs.mevcut_adet as stok_miktari,
                
                um.gerekli_miktar
            FROM urun_malzemeler um
            JOIN urunler u ON um.model_id = u.model_id
            JOIN hammadde_stok hs ON um.stok_id = hs.stok_id
            -- YENİ EKLENEN SATIR: Stoktaki ID ile Hammadde ismini eşleştiriyoruz
            JOIN hammaddeler h ON hs.hammadde_id = h.hammadde_id
            ORDER BY u.model_ad ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error("HAMMADDE ANALİZ HATASI:", error);
        res.status(500).json({ error: error.message, sqlMessage: error.sqlMessage });
    }
};

// --- 7. KRİTİK STOK ORANI (Grafik İçin) ---
export const getKritikStokOrani = async (req, res) => {
    try {
        const sql = `
            SELECT
                COUNT(CASE WHEN COALESCE(a.urun_adet, 0) < COALESCE(a.kritik_adet_stok, 5) THEN 1 END) as kritik_sayisi,
                COUNT(*) as toplam_sayi
            FROM urunler u
            LEFT JOIN adet a ON u.model_id = a.model_id
        `;
        const [rows] = await pool.query(sql);
        const kritik = rows[0].kritik_sayisi;
        const normal = rows[0].toplam_sayi - kritik;

        res.json({ kritik, normal, toplam: rows[0].toplam_sayi });
    } catch (error) {
        res.status(500).json({ error: "Grafik verisi hatası" });
    }
};

// --- 8. SİPARİŞ DURUMU GÜNCELLEME ---
export const updateSiparisDurumu = async (req, res) => {
    const { satis_id, yeni_durum } = req.body;
    try {
        await pool.query('UPDATE magaza_satislar SET siparis_durumu = ? WHERE satis_id = ?', [yeni_durum, satis_id]);
        res.json({ message: "Güncellendi" });
    } catch (error) {
        res.status(500).json({ error: "Güncelleme hatası" });
    }
};


// ... Diğer fonksiyonların en altına ekle ...

// --- 9. HAMMADDE LİSTESİ (Dropdown İçin) ---
export const getHammaddeListesi = async (req, res) => {
    try {
        const sql = `
            SELECT 
                hs.stok_id,
                h.hammadde_ad,
                hs.renk,
                h.birim,
                hs.mevcut_adet
            FROM hammadde_stok hs
            JOIN hammaddeler h ON hs.hammadde_id = h.hammadde_id
            ORDER BY h.hammadde_ad ASC
        `;
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Liste çekilemedi" });
    }
};

// --- 10. YENİ HAMMADDE GİRİŞİ (Stok Ekleme) ---
export const addHammaddeGiris = async (req, res) => {
    const { stok_id, miktar, tarih } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Giriş kaydını loglara ekle (hammadde_girisleri tablosu)
        await connection.query(`
            INSERT INTO hammadde_girisleri (stok_id, giris_miktar, giris_tarihi) 
            VALUES (?, ?, ?)
        `, [stok_id, miktar, tarih]);

        // 2. Ana stok miktarını artır (hammadde_stok tablosu)
        await connection.query(`
            UPDATE hammadde_stok 
            SET mevcut_adet = mevcut_adet + ? 
            WHERE stok_id = ?
        `, [miktar, stok_id]);

        await connection.commit();
        res.json({ message: "Stok girişi başarılı." });

    } catch (error) {
        await connection.rollback();
        console.error("Hammadde Giriş Hatası:", error);
        res.status(500).json({ error: "Stok eklenemedi: " + error.message });
    } finally {
        connection.release();
    }
};

// --- HAMMADDE KRİTİK STOK GRAFİĞİ ---
// --- HAMMADDE KRİTİK STOK GRAFİĞİ (ŞEMAYA GÖRE FİNAL) ---
export async function getHammaddeKritikGrafik(req, res) {
    try {
        // SQL Sorgusu: Şemadaki gerçek sütun isimlerine göre güncellendi
        const query = `
            SELECT 
                CONCAT(h.hammadde_ad, ' (', s.renk, ')') as hammadde_ad, 
                s.mevcut_adet as stok_miktari, 
                COALESCE(s.stok_kritik_sinir, 50) as kritik_sinir
            FROM hammadde_stok s
            JOIN hammaddeler h ON s.hammadde_id = h.hammadde_id
            WHERE s.mevcut_adet <= COALESCE(s.stok_kritik_sinir, 50) * 1.5
            ORDER BY s.mevcut_adet ASC 
            LIMIT 10
        `;
        
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error("Hammadde Grafik Hatası:", error);
        res.json([]);
    }
}