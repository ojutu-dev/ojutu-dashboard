import connectToMongoDB from '../../../libs/mongodb';
import Testimony from '../../../model/testimony';
import { v2 as cloudinary } from 'cloudinary';

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
    try {
      const { title, work, image, star, content } = req.body;
      
      const updatedTestimony = await Testimony.findByIdAndUpdate(
        id,
        { title, work, image, star, content },
        { new: true, runValidators: true }
      );
      if (!updatedTestimony) {
        return res.status(404).json({ message: 'Testimony not found' });
      }
      res.status(200).json(updatedTestimony);
    } catch (error) {
      res.status(500).json({ message: 'Error updating Testimony', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedTestimony = await Testimony.findByIdAndDelete(id);
      if (!deletedTestimony) {
        return res.status(404).json({ message: 'Testimony not found' });
      }
      res.status(200).json({ message: 'Testimony deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Testimony', error });
    }
  }  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
