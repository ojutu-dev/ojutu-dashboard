import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';
import cloudinary from '../../../libs/cloudinary';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id, slug } = req.query; // ✅ Get both `id` and `slug`

  if (req.method === 'GET') {
    try {
      let post;

      if (slug) {
        // ✅ Fetch by slug and select only required fields
        post = await Post.findOne({ slug })
          .populate('author', 'name email') // ✅ Only return `name` and `email`
          .populate('category', 'name') // ✅ Only return `name`
          .select('_id title slug description featuredImage headerImage ogImage body createdAt'); // ✅ Select only required fields
      } else if (id) {
        // ✅ Fetch by ID if no slug is provided
        post = await Post.findById(id)
          .populate('author', 'name email')
          .populate('category', 'name')
          .select('_id title slug description featuredImage headerImage ogImage body createdAt');
      }

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      // ✅ Send only selected fields in response
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
      ).select('_id title slug description featuredImage headerImage ogImage body createdAt');

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
