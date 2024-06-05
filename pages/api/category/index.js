import connectToMongoDB from '../../../libs/mongodb';
import Category from '../../../model/category';


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching categories', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newCategory = new Category({ title, description });
      await newCategory.save();
      res.status(201).json(newCategory);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
