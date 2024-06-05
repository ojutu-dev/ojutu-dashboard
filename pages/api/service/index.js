import connectToMongoDB from '../../../libs/mongodb';
import Service from '../../../model/service';
export const runtime = 'edge';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const service = await Service.find();
      res.status(200).json({success:true, data:service});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching service', error });
      console.log("Error Messgage:", error)
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newService = new Service({ title, description });
      await newService.save();
      res.status(201).json(newService);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
