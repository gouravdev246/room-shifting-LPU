import { Router } from 'express';
import {
  getRooms,
  getRoomById,
  postRoom,
  getRoomContact,
  deleteRoom,
} from './room.controller.js';
import { verifyToken } from '../../common/middlewares/authMiddleware.js';
import { optionalAuth } from '../../common/middlewares/optionalAuth.js';

const router = Router();

// Public discovery routes (filter by hostel, seater, type, block)
router.get('/', getRooms);
router.get('/:id', optionalAuth, getRoomById);

// Protected routes (Login required)
router.post('/', verifyToken, postRoom);
router.get('/:id/contact', verifyToken, getRoomContact);
router.delete('/:id', verifyToken, deleteRoom);

export default router;
