import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import yoneticiRoutes from './routes/yoneticiRoutes.js';
import urunRoutes from "./routes/urunRoutes.js";
import randevuRoutes from "./routes/randevuRoutes.js";
import sepetRoutes from "./routes/sepetRoutes.js"; 
import musteriRoutes from "./routes/musteriRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import atolyeRoutes from './routes/atolyeRoutes.js';
// ...


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/yonetici", yoneticiRoutes);

app.use("/api/urunler", urunRoutes);

app.use("/api/randevular", randevuRoutes);
app.use('/api/urunler', urunRoutes);


app.use('/api/urunler', urunRoutes);

app.use("/api/sepet", sepetRoutes);
app.use("/api/musteri", musteriRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/atolye', atolyeRoutes);
const PORT = 8081;
app.listen(PORT, () => {
    console.log(` Sunucu çalışıyor: http://localhost:${PORT}`);
});

