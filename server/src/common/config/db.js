import './env.js';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Enable WebSockets for Node.js environments to communicate with Neon over Port 443
neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const connectDB = async () => {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT NOW()');
    console.log('✅ Connected to Neon PostgreSQL database at:', res.rows[0].now);
  } finally {
    client.release();
  }
};
