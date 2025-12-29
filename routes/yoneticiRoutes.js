import express from 'express';
// Controller'dan fonksiyonları çekiyoruz
import { 
    getDashboardOzet,     // <-- İŞTE BU EKSİKTİ!
    getSatisListesi, 
    getRandevuListesi, 
    getUrunlerBasit, 
    magazaSatisEkle, 
    getStokDurumu 
} from '../controllers/yoneticiController.js';

const router = express.Router();

// --- 1. DASHBOARD ROTASI (404 HATASINI ÇÖZEN SATIR) ---
// Frontend '/dashboard-stats' isteyince bu çalışacak:
router.get('/dashboard-stats', getDashboardOzet); 

// --- 2. DİĞER LİSTELEME ROTALARI ---
router.get('/satislar', getSatisListesi);
router.get('/randevular', getRandevuListesi);
router.get('/stok', getStokDurumu);

// --- 3. İŞLEM ROTALARI ---
router.get('/urunler-basit', getUrunlerBasit);
router.post('/satis-ekle', magazaSatisEkle);

export default router;