import connectToMongoDB from '../../libs/mongodb';
import Author from '../../model/author';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const authors = await Author.find();
      res.status(200).json(authors);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching authors', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, authorImage, excerpt } = req.body;
      const newAuthor = new Author({ title, authorImage, excerpt });
      await newAuthor.save();
      res.status(201).json(newAuthor);
    } catch (error) {
      res.status(500).json({ message: 'Error creating author', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
