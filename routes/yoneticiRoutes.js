import express from 'express';
import { 
    getDashboardOzet,    
    getSatisListesi, 
    getRandevuListesi, 
    getUrunlerBasit, 
    magazaSatisEkle, 
    getStokDurumu 
} from '../controllers/yoneticiController.js';

const router = express.Router();

router.get('/dashboard-stats', getDashboardOzet); 

router.get('/satislar', getSatisListesi);
router.get('/randevular', getRandevuListesi);
router.get('/stok', getStokDurumu);
router.get('/urunler-basit', getUrunlerBasit);
router.post('/satis-ekle', magazaSatisEkle);

export default router;
