import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ROUTE DOSYALARINI İÇERİ ALIYORUZ
import yoneticiRoutes from './routes/yoneticiRoutes.js';
import urunRoutes from "./routes/urunRoutes.js";
import randevuRoutes from "./routes/randevuRoutes.js";
import sepetRoutes from "./routes/sepetRoutes.js"; // 👈 YENİ EKLENEN
import musteriRoutes from "./routes/musteriRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import atolyeRoutes from './routes/atolyeRoutes.js';
// ...


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIDDLEWARE (Ön Hazırlık)
app.use(cors());
app.use(express.json()); // JSON verilerini okumak için şart
app.use(express.urlencoded({ extended: true }));

// STATİK DOSYALAR (HTML, CSS, JS, Resimler)
app.use(express.static(path.join(__dirname, "public")));
// Eğer resimlerin 'uploads' klasöründeyse onu da dışarı açalım:
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ===================================================
   ROTALAR (YÖNLENDİRMELER)
   =================================================== */

// 1. YÖNETİCİ PANELİ
app.use("/api/yonetici", yoneticiRoutes);

// 2. ÜRÜNLER (Vitrin, Detay, Listeleme)
app.use("/api/urunler", urunRoutes);

// 3. RANDEVULAR
app.use("/api/randevular", randevuRoutes);
app.use('/api/urunler', urunRoutes);

// server.js


app.use('/api/urunler', urunRoutes);

// 4. SEPET VE SATIN ALMA (👈 YENİ EKLENEN KISIM)
app.use("/api/sepet", sepetRoutes);
app.use("/api/musteri", musteriRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/atolye', atolyeRoutes);
/* ===================================================
   SUNUCUYU BAŞLAT
   =================================================== */
const PORT = 8081;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu çalışıyor: http://localhost:${PORT}`);
});

