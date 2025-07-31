import connectToMongoDB from '../../../libs/mongodb';
import Keywords from '../../../model/keywords';
import cors from '../../../libs/cors';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);
  await cors(req, res);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const keywords = await Keywords.findById(id);
      if (!keywords) {
        return res.status(404).json({ message: 'Keywords not found' });
      }
      res.status(200).json(keywords);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching keywords', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description } = req.body;
      const updatedKeywords = await Keywords.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );
      if (!updatedKeywords) {
        return res.status(404).json({ message: 'Keywords not found' });
      }
      res.status(200).json(updatedKeywords);
    } catch (error) {
      res.status(500).json({ message: 'Error updating keywords', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedKeywords = await Keywords.findByIdAndDelete(id);
      if (!deletedKeywords) {
        return res.status(404).json({ message: 'Keywords not found' });
      }
      res.status(200).json({ message: 'Keywords deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Keywords', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}