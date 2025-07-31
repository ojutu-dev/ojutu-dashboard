import connectToMongoDB from '../../../../libs/mongodb';
import Author from '../../../../model/author';
import Post from '../../../../model/post';
import cors from '../../../../libs/cors';

const models = {
  author: Author,
  post: Post,
};

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);
  await cors(req, res);

  const { slug, type } = req.query;
  const Model = models[type];

  if (!Model) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  if (req.method === 'GET') {
    try {
      const existingDocument = await Model.findOne({ slug });
      res.status(200).json({ exists: !!existingDocument });
    } catch (error) {
      res.status(500).json({ message: 'Error checking slug', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}