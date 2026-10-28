import './common/config/env.js';
import app from './app.js';
import { connectDB } from './common/config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (process.env.DATABASE_URL) {
      try {
        await connectDB();
      } catch (dbError) {
        const errorDetail = dbError?.errors
          ? dbError.errors.map((e) => e.message).join(', ')
          : (dbError?.message || String(dbError));
        console.error('❌ Failed to connect to PostgreSQL database:', errorDetail);
        console.warn('⚠️  Continuing server startup without active database connection...');
      }
    } else {
      console.warn('⚠️  DATABASE_URL not found in .env. Skipping database connection on startup.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message || error);
    process.exit(1);
  }
}

startServer();
