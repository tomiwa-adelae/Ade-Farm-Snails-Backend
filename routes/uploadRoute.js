import express from 'express';
import cloudinary from '../middleware/cloudinary.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Upload a photo
// POST @/api/upload
// Public
router.post('/', async (req, res) => {
   try {
      const { data } = req.body;

      const uploadResponse = await cloudinary.v2.uploader.upload(data, {
         upload_preset: 'adefarmsnails',
      });

      res.json({
         url: uploadResponse.url,
         public_id: uploadResponse.public_id,
      });
   } catch (err) {
      console.error(err);
      res.status(500).json({
         msg: 'Something went wrong! Image not uploaded!',
      });
   }
});

// Delete a photo
// DELETE@api/uploads/delete
router.post('/delete', async (req, res) => {
   try {
      const { publicId } = req.body;

      await cloudinary.uploader.destroy(
         publicId,
         { invalidate: true },
         {
            upload_preset: 'adefarmsnails',
         }
      );

      res.send({ success: true });
   } catch (err) {
      res.status(500).json({
         msg: 'Something went wrong! Image not deleted!',
      });
   }
});

export default router;
