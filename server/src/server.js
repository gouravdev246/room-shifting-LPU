import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './common/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.DATABASE_URL) {
      await connectDB();
    } else {
      console.warn('⚠️  DATABASE_URL not found in .env. Skipping database connection on startup.');
    }

    app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
