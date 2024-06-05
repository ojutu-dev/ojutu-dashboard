import connectToMongoDB from '../../../libs/mongodb';
import Author from '../../../model/author';
export const config = {
  runtime: 'edge', 
  unstable_allowDynamic: [
    '../../../libs/mongodb', 
    '/node_modules/function-bind/**', 
  ],
}


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const author = await Author.findById(id);
      if (!author) {
        return res.status(404).json({ message: 'Author not found' });
      }
      res.status(200).json(author);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching author', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, image, slug, description } = req.body;
      const updatedAuthor = await Author.findByIdAndUpdate(
        id,
        { name, image, slug, description },
        { new: true, runValidators: true }
      );
      if (!updatedAuthor) {
        return res.status(404).json({ message: 'Author not found' });
      }
      res.status(200).json(updatedAuthor);
    } catch (error) {
      res.status(500).json({ message: 'Error updating author', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedAuthor = await Author.findByIdAndDelete(id);
      if (!deletedAuthor) {
        return res.status(404).json({ message: 'Author not found' });
      }
      res.status(200).json({ message: 'Author deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting author', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
