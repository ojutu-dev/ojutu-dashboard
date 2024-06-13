import connectToMongoDB from '../../../libs/mongodb';
import Author from '../../../model/author';
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
      const authors = await Author.find();
      res.status(200).json({success: true, data:authors});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching authors', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, image, slug, description } = req.body;

      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: 'ojutu',
      });

      const newAuthor = new Author({
        name,
        image: uploadedImage.secure_url,
        slug,
        description,
      });
      await newAuthor.save();
      res.status(201).json(newAuthor);
    } catch (error) {
      res.status(500).json({ message: 'Error creating author', error });
    }
  }  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}