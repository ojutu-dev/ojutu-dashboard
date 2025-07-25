
import { v2 as cloudinary } from 'cloudinary';
import cors from '../../../libs/cors';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { resources } = await cloudinary.search
      .expression('folder:ojutu')
      .sort_by('public_id', 'desc')
      .max_results(30)
      .execute();

    const images = resources.map(resource => ({
      url: resource.secure_url,
      public_id: resource.public_id,
    }));

    res.status(200).json({ success: true, data: images });
  } catch (error) {
    console.error('Error fetching images from Cloudinary:', error);
    res.status(500).json({ message: 'Error fetching images from Cloudinary', error: error.message });
  }
}