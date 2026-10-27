import { Router } from 'express';
import { uploadMiddleware, uploadToCloudinary } from './upload.service.js';
import { verifyToken } from '../../common/middlewares/authMiddleware.js';

const router = Router();

/**
 * Upload up to 5 room photos to Cloudinary
 * POST /api/upload/photos
 */
router.post(
  '/photos',
  verifyToken,
  uploadMiddleware.array('photos', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No image files uploaded.',
        });
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'room_shifting_lpu')
      );

      const results = await Promise.all(uploadPromises);

      return res.status(200).json({
        success: true,
        message: 'Photos uploaded successfully to Cloudinary.',
        photos: results,
      });
    } catch (error) {
      console.error('Error during photo upload:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload photos to Cloudinary.',
        error: error.message,
      });
    }
  }
);

export default router;
