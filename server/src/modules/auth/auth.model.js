import { pool } from '../../common/config/db.js';

export const findUserByRegIdOrPhone = async (identifier) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE reg_id = $1 OR phone = $1',
    [identifier]
  );
  return result.rows[0];
};

export const findConflictingUser = async (regId, phone) => {
  const result = await pool.query(
    'SELECT id, reg_id, phone FROM users WHERE reg_id = $1 OR phone = $2',
    [regId, phone]
  );
  return result.rows[0];
};

export const createUser = async ({ name, regId, phone, hostel, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (name, reg_id, phone, hostel, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, reg_id, phone, hostel, created_at`,
    [name, regId, phone, hostel, passwordHash]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    'SELECT id, name, reg_id, phone, hostel, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0];
};
