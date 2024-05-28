import connectToMongoDB from '../../../libs/mongodb';
import Testimony from '../../../model/testimony';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const testimonies = await Testimony.find();
      res.status(200).json({success: true, data: testimonies});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching testimonies', error });
    }
  } else if (req.method === 'POST') {
    const { title, work, image, star, content } = req.body;
    try {

      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: 'ojutu',
      });

      const testimony = new Testimony({
        title,
        work,
        image: uploadedImage.secure_url,
        star,
        content,
      });

      await testimony.save();

      res.status(201).json(testimony);
    } catch (error) {
      res.status(500).json({ message: 'Error creating testimony', error });
      console.error('Error uploading image:', error);
      console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
