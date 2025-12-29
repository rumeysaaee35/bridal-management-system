

import pool from "../config/db.js";
import express from "express";
import { getPhotosByModel } from "../controllers/photoController.js";


const router = express.Router();
router.get("/:id", getPhotosByModel);
export default router;
