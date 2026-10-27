import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Running database schema migrations on Neon...');
  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('Database tables (users, rooms, room_photos) created successfully!');
  } catch (err) {
    console.error('Error creating database tables:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
