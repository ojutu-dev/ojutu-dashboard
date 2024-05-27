import connectToMongoDB from '../../../libs/mongodb';
import Testimony from '../../../model/testimony';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const { id } = req.query;
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const testimony = await Testimony.findById(id);
      if (!testimony) {
        return res.status(404).json({ message: 'Testimony not found' });
      }
      res.status(200).json({success:true, data:testimony});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching testimony', error });
    }
  } else if (req.method === 'PUT') {
    const { title, work, image, star, content } = req.body;
    try {
      const testimony = await Testimony.findById(id);
      if (!testimony) {
        return res.status(404).json({ message: 'Testimony not found' });
      }

      // If there's a new image, upload it to Cloudinary
      if (image) {
        const uploadedImage = await cloudinary.uploader.upload(image, {
          folder: 'testimonies',
        });
        testimony.image = uploadedImage.secure_url;
      }

      // Update the testimony fields
      if (title) testimony.title = title;
      if (work) testimony.work = work;
      if (star) testimony.star = star;
      if (content) testimony.content = content;

      await testimony.save();

      res.status(200).json(testimony);
    } catch (error) {
      res.status(500).json({ message: 'Error updating testimony', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const testimony = await Testimony.findById(id);
      if (!testimony) {
        return res.status(404).json({ message: 'Testimony not found' });
      }

      await testimony.remove();
      res.status(200).json({ message: 'Testimony deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting testimony', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
