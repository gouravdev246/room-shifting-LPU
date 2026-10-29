import {
  findRooms,
  findRoomById,
  createRoom,
  addRoomPhotos,
  deleteRoomById,
} from './room.model.js';
import redis from '../../common/config/redis.js';

// Cache TTL for room listings: 10 minutes (600 seconds)
export const ROOMS_CACHE_TTL = 10 * 60;

/**
 * Generate a deterministic Redis cache key based on query filters.
 * Returns 'rooms:all' when no query parameters are present.
 * Example: 'rooms:block=b:hostel=bh-1:seater=3:type=ac'
 */
export const generateRoomsCacheKey = (filters = {}) => {
  const allowedParams = ['hostel', 'type', 'seater', 'block'];
  const activeFilters = [];

  for (const param of allowedParams) {
    const val = filters[param];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      activeFilters.push(`${param}=${String(val).trim().toLowerCase()}`);
    }
  }

  return activeFilters.length > 0
    ? `rooms:${activeFilters.sort().join(':')}`
    : 'rooms:all';
};

/**
 * Helper to invalidate all rooms cache entries upon creation or deletion
 */
export const invalidateRoomsCache = async () => {
  try {
    if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
      const keys = await redis.keys('rooms:*');
      if (keys && keys.length > 0) {
        await redis.del(keys);
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not invalidate rooms Redis cache:', err.message);
  }
};

/**
 * Public: Browse & filter rooms
 * GET /api/rooms?hostel=BH-1&type=AC&seater=3&block=B
 */
export const getRooms = async (req, res) => {
  try {
    const { hostel, type, seater, block } = req.query;
    const cacheKey = generateRoomsCacheKey({ hostel, type, seater, block });

    // 1. Attempt to serve from Redis cache if available
    try {
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          const rooms = JSON.parse(cachedData);
          return res.status(200).json({
            success: true,
            count: rooms.length,
            source: 'cache',
            rooms,
          });
        }
      }
    } catch (redisError) {
      console.warn('⚠️ Redis get error, falling back to database:', redisError.message);
    }

    // 2. Fallback / Cache Miss: Fetch from database
    const rooms = await findRooms({ hostel, type, seater, block });

    // 3. Store in Redis cache with 10-minute TTL (600s)
    try {
      if (redis && (redis.status === 'ready' || redis.status === 'connect')) {
        await redis.set(cacheKey, JSON.stringify(rooms), 'EX', ROOMS_CACHE_TTL);
      }
    } catch (redisError) {
      console.warn('⚠️ Redis set error:', redisError.message);
    }

    return res.status(200).json({
      success: true,
      count: rooms.length,
      source: 'db',
      rooms,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching rooms.',
      error: error.message,
    });
  }
};

/**
 * Public: Get single room details
 * GET /api/rooms/:id
 */
export const getRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await findRoomById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Per Wireframe: Only logged-in users can view contact details
    // If unauthenticated, mask phone number
    const isOwner = req.user && req.user.id === room.user_id;
    const isAuthenticated = !!req.user;

    const sanitizedRoom = {
      ...room,
      owner_phone: isAuthenticated
        ? room.owner_phone
        : (room.owner_phone ? `${room.owner_phone.slice(0, 2)}******${room.owner_phone.slice(-2)}` : null),
      can_view_contact: isAuthenticated,
      is_owner: isOwner,
    };

    return res.status(200).json({
      success: true,
      room: sanitizedRoom,
    });
  } catch (error) {
    console.error('Error fetching room detail:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching room details.',
      error: error.message,
    });
  }
};

/**
 * Protected: Add a new room listing
 * POST /api/rooms
 */
export const postRoom = async (req, res) => {
  try {
    const {
      hostel_name,
      room_number,
      block,
      room_type,
      seater,
      resident_name,
      floor,
      description,
      photos, // Array of URLs or uploaded Cloudinary objects [{ imageUrl, publicId }]
    } = req.body;

    if (!hostel_name || !room_number || !block || !room_type || !seater) {
      return res.status(400).json({
        success: false,
        message: 'hostel_name, room_number, block, room_type, and seater are required.',
      });
    }

    const newRoom = await createRoom({
      userId: req.user.id,
      hostelName: hostel_name.trim(),
      roomNumber: room_number.trim(),
      block: block.trim(),
      roomType: room_type.trim(),
      seater: Number(seater),
      residentName: resident_name ? resident_name.trim() : req.user.name,
      floor: floor ? Number(floor) : null,
      description: description ? description.trim() : null,
    });

    // Add photos if provided
    let insertedPhotos = [];
    if (photos && Array.isArray(photos) && photos.length > 0) {
      const formattedPhotos = photos.map((item) =>
        typeof item === 'string'
          ? { imageUrl: item, publicId: null }
          : { imageUrl: item.imageUrl || item.url, publicId: item.publicId || null }
      );
      insertedPhotos = await addRoomPhotos(newRoom.id, formattedPhotos);
    }

    // Invalidate rooms cache so new listing appears immediately
    await invalidateRoomsCache();

    return res.status(201).json({
      success: true,
      message: 'Room listed successfully for shifting/swapping!',
      room: {
        ...newRoom,
        photos: insertedPhotos,
      },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error creating room listing.',
      error: error.message,
    });
  }
};

/**
 * Protected: Get verified owner contact info (WhatsApp / Call)
 * GET /api/rooms/:id/contact
 */
export const getRoomContact = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await findRoomById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    const cleanPhone = (room.owner_phone || '').replace(/\D/g, '');
    const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    return res.status(200).json({
      success: true,
      contact: {
        owner_name: room.owner_name,
        phone: room.owner_phone,
        whatsapp_url: `https://wa.me/${internationalPhone}?text=${encodeURIComponent(
          `Hi ${room.owner_name}, I saw your room listing (${room.hostel_name} Block ${room.block} Room ${room.room_number}) on Room Shifting LPU.`
        )}`,
      },
    });
  } catch (error) {
    console.error('Error getting room contact:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching contact information.',
      error: error.message,
    });
  }
};

/**
 * Protected: Delete room listing (Owner only)
 * DELETE /api/rooms/:id
 */
export const deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const deleted = await deleteRoomById(roomId, req.user.id);

    if (!deleted) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this room or it does not exist.',
      });
    }

    // Invalidate rooms cache
    await invalidateRoomsCache();

    return res.status(200).json({
      success: true,
      message: 'Room listing removed successfully.',
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting room listing.',
      error: error.message,
    });
  }
};
