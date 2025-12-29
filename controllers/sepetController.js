import pool from "../config/db.js";

// SEPETİ ONAYLA VE VERİTABANINA KAYDET
export async function sepetiOnayla(req, res) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { musteri_ad, musteri_soyad, telefon_no, adres, urunler } = req.body;
        // urunler: [{ id: 1, adet: 1, fiyat: 15000, beden: '36' }, ...] şeklinde gelecek

        for (const urun of urunler) {
            const toplam_tutar = Number(urun.fiyat) * Number(urun.adet);

            // 1. Satış Tablosuna Ekle (magaza_satislar)
            await connection.query(`
                INSERT INTO magaza_satislar 
                (musteri_ad, musteri_soyad, telefon_no, adres, model_id, adet, birim_fiyat, toplam_tutar, islem_turu, beden, satis_tarihi)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'satis', ?, NOW())
            `, [musteri_ad, musteri_soyad, telefon_no, adres, urun.id, urun.adet, urun.fiyat, toplam_tutar, urun.beden]);

            // 2. Stoktan Düş (adet tablosundan)
            // Önce stok var mı kontrol et
            const [stokKontrol] = await connection.query("SELECT * FROM adet WHERE model_id = ?", [urun.id]);
            
            if(stokKontrol.length > 0) {
                await connection.query("UPDATE adet SET urun_adet = urun_adet - ? WHERE model_id = ?", [urun.adet, urun.id]);
            }
        }

        await connection.commit();
        res.json({ success: true, message: "Siparişiniz alındı! Teşekkür ederiz." });

    } catch (err) {
        await connection.rollback();
        console.error("Sipariş Hatası:", err);
        res.status(500).json({ success: false, message: "Sipariş oluşturulurken hata oluştu." });
    } finally {
        connection.release();
    }
}