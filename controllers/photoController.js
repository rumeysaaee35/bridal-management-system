import pool from "../config/db.js";

export const getPhotosByModel = async (req, res) => {
  try {
    const id = req.params.id;

    const [rows] = await pool.query(
      "SELECT filename FROM photos WHERE model_id = ?",
      [id]
    );

    const photos = rows.map(r => ({
      path: `uploads/${r.filename}`
    }));

    res.json(photos);

  } catch (err) {
    console.error("PHOTO ERROR:", err);
    res.status(500).json({ error: "Fotoğraflar alınamadı" });
  }
};


