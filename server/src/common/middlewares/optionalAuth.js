import jwt from 'jsonwebtoken';
import { pool } from '../../common/config/db.js';

export const optionalAuth = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lpu_room_shifting_jwt_secret_key_2026_secure'
      );
      const userQuery = await pool.query(
        'SELECT id, name, reg_id, phone, hostel, created_at FROM users WHERE id = $1',
        [decoded.id]
      );
      if (userQuery.rows.length > 0) {
        req.user = userQuery.rows[0];
      }
    }
  } catch (err) {
    // Silently continue if unauthenticated or token expired
  }
  next();
};
