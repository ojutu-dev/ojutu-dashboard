import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const post = await Post.findById(id).populate('author').populate('category');
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ message: 'Error fetching post', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, slug, description, featuredImage, headerImage, ogImage, body, authorId, categoryId } = req.body;

      const uploadImage = async (image) => {
        if (image && image.startsWith('data:image')) {
          const uploadResult = await cloudinary.uploader.upload(image, { folder: 'ojutu' });
          return uploadResult.secure_url;
        }
        return image;
      };

      const [featuredImageUrl, headerImageUrl, ogImageUrl] = await Promise.all([
        uploadImage(featuredImage),
        uploadImage(headerImage),
        uploadImage(ogImage),
      ]);

      const updatedPost = await Post.findByIdAndUpdate(
        id,
        {
          title,
          slug,
          description,
          featuredImage: featuredImageUrl,
          headerImage: headerImageUrl,
          ogImage: ogImageUrl,
          body,
          author: authorId,
          category: categoryId,
        },
        { new: true, runValidators: true }
      );

      if (!updatedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Error updating post', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json({ message: 'Post deleted' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
