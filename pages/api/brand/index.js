import connectToMongoDB from '../../../libs/mongodb';
import Brand from '../../../model/brand';


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const brand = await Brand.find();
      res.status(200).json({success:true, data:brand});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching brand', error });
      console.log("Error Messgage:", error)
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newBrand = new Brand({ title, description });
      await newBrand.save();
      res.status(201).json(newBrand);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
