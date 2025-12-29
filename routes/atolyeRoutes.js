import express from 'express';
import { 
    health,
    getModelStoklari,
    getMagazaSatislari,
    getUretimler,
    addUretim,
    getHammaddeListesi,
    addHammaddeGiris,
    getMalzemeGiderleri,
    getKritikStokOrani ,// <-- YENİ: Bunu ekle
    updateSiparisDurumu,
    getHammaddeKritikGrafik
} from '../controllers/atolyeController.js';

const router = express.Router();

router.get('/health', health);
router.get('/model-stoklari', getModelStoklari);
router.get('/magaza-satislari', getMagazaSatislari);
router.get('/uretimler', getUretimler);
router.post('/uretim', addUretim);
router.get('/malzeme-giderleri', getMalzemeGiderleri);
router.get('/malzeme-giderleri', getMalzemeGiderleri);
router.get('/kritik-stok-orani', getKritikStokOrani); // <-- YENİ: Bunu ekle
router.post('/siparis-durum-guncelle', updateSiparisDurumu);
router.get('/hammadde-listesi', getHammaddeListesi); // Dropdown için
router.post('/hammadde-giris', addHammaddeGiris);    // Kayıt için
router.get('/hammadde-grafik', getHammaddeKritikGrafik);

export default router;