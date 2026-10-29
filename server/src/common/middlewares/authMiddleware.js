import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import '../config/env.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login to continue.',
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'lpu_room_shifting_jwt_secret_key_2026_secure'
    );

    const userQuery = await pool.query(
      `SELECT 
         id, 
         st_name as name, 
         st_reg_id as reg_id, 
         st_phone as phone, 
         st_hostel as hostel, 
         created_at 
       FROM users 
       WHERE id = $1`,
      [decoded.id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User not found.',
      });
    }

    req.user = userQuery.rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      error: error.message,
    });
  }
};
