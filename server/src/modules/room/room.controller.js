import {
  findRooms,
  findRoomById,
  createRoom,
  addRoomPhotos,
  deleteRoomById,
} from './room.model.js';

/**
 * Public: Browse & filter rooms
 * GET /api/rooms?hostel=BH-1&type=AC&seater=3&block=B
 */
export const getRooms = async (req, res) => {
  try {
    const { hostel, type, seater, block } = req.query;
    const rooms = await findRooms({ hostel, type, seater, block });

    return res.status(200).json({
      success: true,
      count: rooms.length,
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
        : `${room.owner_phone.slice(0, 2)}******${room.owner_phone.slice(-2)}`,
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

    const cleanPhone = room.owner_phone.replace(/\D/g, '');
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
