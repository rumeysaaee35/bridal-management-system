import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "gelinlik",
  port:8889,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


// Bağlantıyı test et
pool.getConnection()
  .then(conn => {
    console.log("✅ Veritabanı bağlantısı BAŞARILI!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Veritabanı bağlantı HATASI:", err.message);
  });

export default pool;