import { pool } from '../../common/config/db.js';

/**
 * Fetch all rooms with optional filtering and joined photos
 */
export const findRooms = async ({ hostel, type, seater, block } = {}) => {
  let query = `
    SELECT 
      r.id,
      r.st_id as user_id,
      r.st_hostel_name as hostel_name,
      r.st_room_number as room_number,
      r.st_block_number as block,
      r.st_room_type as room_type,
      r.st_seater as seater,
      r.st_resident_name as resident_name,
      r.st_description as description,
      r.st_status as status,
      r.created_at,
      u.st_name as owner_name,
      COALESCE(
        json_agg(
          json_build_object('id', p.id, 'image_url', p.image_url)
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as photos
    FROM rooms r
    LEFT JOIN users u ON r.st_id = u.id
    LEFT JOIN room_photos p ON r.id = p.room_id
    WHERE 1=1
  `;

  const values = [];
  let paramCount = 1;

  if (hostel && String(hostel).trim()) {
    query += ` AND LOWER(r.st_hostel_name) = LOWER($${paramCount++})`;
    values.push(String(hostel).trim());
  }
  if (type && String(type).trim()) {
    query += ` AND LOWER(r.st_room_type) = LOWER($${paramCount++})`;
    values.push(String(type).trim());
  }
  if (seater && !isNaN(Number(seater))) {
    query += ` AND r.st_seater = $${paramCount++}`;
    values.push(Number(seater));
  }
  if (block && String(block).trim()) {
    query += ` AND LOWER(r.st_block_number) = LOWER($${paramCount++})`;
    values.push(String(block).trim());
  }

  query += `
    GROUP BY r.id, u.st_name
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
      r.st_id as user_id,
      r.st_hostel_name as hostel_name,
      r.st_room_number as room_number,
      r.st_block_number as block,
      r.st_room_type as room_type,
      r.st_seater as seater,
      r.st_resident_name as resident_name,
      r.st_description as description,
      r.st_status as status,
      r.created_at,
      u.st_name as owner_name,
      u.st_phone as owner_phone,
      u.st_hostel as owner_current_hostel,
      COALESCE(
        json_agg(
          json_build_object('id', p.id, 'image_url', p.image_url)
        ) FILTER (WHERE p.id IS NOT NULL), '[]'
      ) as photos
    FROM rooms r
    LEFT JOIN users u ON r.st_id = u.id
    LEFT JOIN room_photos p ON r.id = p.room_id
    WHERE r.id = $1
    GROUP BY r.id, u.st_name, u.st_phone, u.st_hostel
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
  residentName,
  description,
}) => {
  const result = await pool.query(
    `INSERT INTO rooms (st_id, st_hostel_name, st_room_number, st_block_number, st_room_type, st_seater, st_resident_name, st_description)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING 
       id,
       st_id as user_id,
       st_hostel_name as hostel_name,
       st_room_number as room_number,
       st_block_number as block,
       st_room_type as room_type,
       st_seater as seater,
       st_resident_name as resident_name,
       st_description as description,
       st_status as status,
       created_at`,
    [userId, hostelName, roomNumber, block, roomType, seater, residentName || 'Student', description]
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
    'DELETE FROM rooms WHERE id = $1 AND st_id = $2 RETURNING id',
    [roomId, userId]
  );
  return result.rows[0];
};
