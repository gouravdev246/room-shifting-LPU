import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDB() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔄 Connecting to Neon PostgreSQL...');
  const client = await pool.connect();
  try {
    console.log('🗑️  Dropping old tables if they exist to apply updated schema...');
    await client.query(`
      DROP TABLE IF EXISTS room_photos CASCADE;
      DROP TABLE IF EXISTS rooms CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS find_roommate CASCADE;
    `);

    console.log('🚀 Running database schema migrations on Neon...');
    await client.query(sql);
    console.log('✅ Database tables (users, rooms, room_photos, find_roommate) created successfully with new schema!');
  } catch (err) {
    console.error('❌ Error creating database tables:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDB();
