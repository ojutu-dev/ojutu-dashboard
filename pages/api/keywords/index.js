import connectToMongoDB from '../../../libs/mongodb';
import Keywords from '../../../model/keywords';


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const keywords = await Keywords.find();
      res.status(200).json({success:true, data:keywords});
    } catch (error) {
      res.status(500).json({ message: 'Error fetching keywords', error });
      console.log("Error Messgage:", error)
    }
  } else if (req.method === 'POST') {
    try {
      const { title, description } = req.body;
      const newKeywords = new Keywords({ title, description });
      await newKeywords.save();
      res.status(201).json(newKeywords);
    } catch (error) {
      res.status(500).json({ message: 'Error creating category', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
