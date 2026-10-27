import { pool } from '../../common/config/db.js';

/**
 * Fetch all rooms with optional filtering and joined photos
 */
export const findRooms = async ({ hostel, type, seater, block }) => {
  let query = `
    SELECT 
      r.id,
      r.user_id,
      r.hostel_name,
      r.room_number,
      r.block,
      r.room_type,
      r.seater,
      r.floor,
      r.description,
      r.status,
      r.created_at,
      u.name as owner_name,
      COALESCE(
        json_agg(
          json_build_object('id', p.id, 'image_url', p.image_url)
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as photos
    FROM rooms r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN room_photos p ON r.id = p.room_id
    WHERE 1=1
  `;

  const values = [];
  let paramCount = 1;

  if (hostel) {
    query += ` AND LOWER(r.hostel_name) = LOWER($${paramCount++})`;
    values.push(hostel);
  }
  if (type) {
    query += ` AND LOWER(r.room_type) = LOWER($${paramCount++})`;
    values.push(type);
  }
  if (seater) {
    query += ` AND r.seater = $${paramCount++}`;
    values.push(Number(seater));
  }
  if (block) {
    query += ` AND LOWER(r.block) = LOWER($${paramCount++})`;
    values.push(block);
  }

  query += `
    GROUP BY r.id, u.name
    ORDER BY r.created_at DESC
  `;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Fetch a single room by ID with owner info and photos
 */
export const findRoomById = async (roomId) => {
  const query = `
    SELECT 
      r.id,
      r.user_id,
      r.hostel_name,
      r.room_number,
      r.block,
      r.room_type,
      r.seater,
      r.floor,
      r.description,
      r.status,
      r.created_at,
      u.name as owner_name,
      u.phone as owner_phone,
      u.hostel as owner_current_hostel,
      COALESCE(
        json_agg(
          json_build_object('id', p.id, 'image_url', p.image_url)
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as photos
    FROM rooms r
    JOIN users u ON r.user_id = u.id
    LEFT JOIN room_photos p ON r.id = p.room_id
    WHERE r.id = $1
    GROUP BY r.id, u.name, u.phone, u.hostel
  `;

  const result = await pool.query(query, [roomId]);
  return result.rows[0];
};

/**
 * Insert a new room listing
 */
export const createRoom = async ({
  userId,
  hostelName,
  roomNumber,
  block,
  roomType,
  seater,
  floor,
  description,
}) => {
  const result = await pool.query(
    `INSERT INTO rooms (user_id, hostel_name, room_number, block, room_type, seater, floor, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [userId, hostelName, roomNumber, block, roomType, seater, floor, description]
  );
  return result.rows[0];
};

/**
 * Save photos for a room
 */
export const addRoomPhotos = async (roomId, photos = []) => {
  if (photos.length === 0) return [];
  const inserted = [];
  for (const photo of photos) {
    const res = await pool.query(
      `INSERT INTO room_photos (room_id, image_url, public_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [roomId, photo.imageUrl, photo.publicId || null]
    );
    inserted.push(res.rows[0]);
  }
  return inserted;
};

/**
 * Delete a room (only by owner)
 */
export const deleteRoomById = async (roomId, userId) => {
  const result = await pool.query(
    'DELETE FROM rooms WHERE id = $1 AND user_id = $2 RETURNING id',
    [roomId, userId]
  );
  return result.rows[0];
};
