import { pool } from '../../common/config/db.js';

export const findUserByRegIdOrPhone = async (identifier) => {
  const result = await pool.query(
    `SELECT 
       id, 
       st_name as name, 
       st_reg_id as reg_id, 
       st_phone as phone, 
       st_hostel as hostel, 
       st_password_hash as password_hash, 
       created_at 
     FROM users 
     WHERE st_reg_id = $1 OR st_phone = $1`,
    [identifier]
  );
  return result.rows[0];
};

export const findConflictingUser = async (regId, phone) => {
  const result = await pool.query(
    `SELECT 
       id, 
       st_reg_id as reg_id, 
       st_phone as phone 
     FROM users 
     WHERE st_reg_id = $1 OR st_phone = $2`,
    [regId, phone]
  );
  return result.rows[0];
};

export const createUser = async ({ name, regId, phone, hostel, passwordHash }) => {
  const result = await pool.query(
    `INSERT INTO users (st_name, st_reg_id, st_phone, st_hostel, st_password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING 
       id, 
       st_name as name, 
       st_reg_id as reg_id, 
       st_phone as phone, 
       st_hostel as hostel, 
       created_at`,
    [name, regId, phone, hostel, passwordHash]
  );
  return result.rows[0];
};

export const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT 
       id, 
       st_name as name, 
       st_reg_id as reg_id, 
       st_phone as phone, 
       st_hostel as hostel, 
       created_at 
     FROM users 
     WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};
