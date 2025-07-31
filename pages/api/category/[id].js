import connectToMongoDB from '../../../libs/mongodb';
import Category from '../../../model/category';
import cors from '../../../libs/cors';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);
  await cors(req, res);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching category', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description } = req.body;
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: 'Error updating category', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedCategory = await Category.findByIdAndDelete(id);
      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }
      res.status(200).json({ message: 'Category deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting category', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}