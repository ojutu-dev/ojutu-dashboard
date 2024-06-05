import connectToMongoDB from '../../../libs/mongodb';
import Brand from '../../../model/brand';
export const runtime = 'edge';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const brand = await Brand.findById(id);
      if (!brand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      res.status(200).json(brand);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brand', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description } = req.body;
      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );
      if (!updatedBrand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      res.status(200).json(updatedBrand);
    } catch (error) {
      res.status(500).json({ message: 'Error updating Brand', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedBrand = await Brand.findByIdAndDelete(id);
      if (!deletedBrand) {
        return res.status(404).json({ message: 'Brand not found' });
      }
      res.status(200).json({ message: 'Brand deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting Brand', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
