import "dotenv/config";
import app from "./app.ts";
import { testDatabase } from "./config/database.ts";

const PORT = Number(process.env.PORT) || 8000;

async function startServer() {
  try {
    await testDatabase();

    console.log("Database Makery berhasil terhubung!");

    app.listen(PORT, () => {
      console.log(`Makery API berjalan di port ${PORT}`);
    });
  } catch (error) {
    console.error("Gagal menghubungkan database:", error);
    process.exit(1);
  }
}

startServer();
