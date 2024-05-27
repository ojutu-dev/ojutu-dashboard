import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await Post.findById(id).populate('authorId').populate('categoryId');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, slug, description, featuredImage, headerImage, ogImage, body, authorId, categoryId } = req.body;
      const updatedPost = await Post.findByIdAndUpdate(
        id,
        { title, slug, description, featuredImage, headerImage, ogImage, body, authorId, categoryId },
        { new: true, runValidators: true }
      );
      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: 'Error updating post', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
