import express from "express";
import { sepetiOnayla } from "../controllers/sepetController.js";

const router = express.Router();

router.post("/satin-al", sepetiOnayla);

export default router;