import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';
import Author from '../../../model/author';
import Category from '../../../model/category';
import cloudinary from '../../../libs/cloudinary';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id, slug } = req.query;

  if (req.method === 'GET') {
    try {
      let posts;

      if (slug) {
        posts = await Post.findOne({ slug })
          .populate('author', 'name email')
          .populate('category', 'name')
          .select('_id title slug description featuredImage headerImage ogImage body createdAt');
      } else if (id) {
        posts = await Post.findById(id)
          .populate('author', 'name email')
          .populate('category', 'name')
          .select('_id title slug description featuredImage headerImage ogImage body createdAt');
      } else {
        posts = await Post.find()
          .populate('author', 'name email')
          .populate('category', 'name')
          .select('_id title slug description featuredImage createdAt');

        return res.status(200).json({
          success: true,
          count: posts.length,
          data: posts
        });
      }

      if (!posts) {
        return res.status(404).json({ message: 'Post not found' });
      }

      res.status(200).json(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error fetching posts', error: error.message });
    }
  }  else if (req.method === 'POST') {
    const { title, description, slug, featuredImage, authorId, body, headerImage, ogImage, categoryId } = req.body;
    try {
      const author = await Author.findById(authorId);
      const category = await Category.findById(categoryId);

      if (!author) {
        throw new Error(`Author with ID ${authorId} not found`);
      }

      if (!category) {
        throw new Error(`Category with ID ${categoryId} not found`);
      }

      const uploadBase64Image = async (base64Image) => {
        if (base64Image) {
          try {
            const uploadResult = await cloudinary.uploader.upload(base64Image, { folder: 'ojutu' });
            return uploadResult.secure_url;
          } catch (uploadError) {
            console.error('Error uploading image to Cloudinary:', uploadError);
            throw uploadError;
          }
        }
        return null;
      };

      const [featuredImageUrl, headerImageUrl, ogImageUrl] = await Promise.all([
        uploadBase64Image(featuredImage),
        uploadBase64Image(headerImage),
        uploadBase64Image(ogImage),
      ]);

      const post = new Post({
        title,
        slug,
        description,
        featuredImage: featuredImageUrl,
        headerImage: headerImageUrl,
        ogImage: ogImageUrl,
        body,
        author: authorId,
        category: categoryId,
      });

      await post.save();
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error.stack);
      res.status(500).json({ message: 'Error creating post', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!id) {
        return res.status(400).json({ message: 'Post ID is required for update' });
      }

      const { title, description, slug, featuredImage, headerImage, ogImage, body, authorId, categoryId } = req.body;

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
      res.status(200).json({ success: true, message: 'Post updated successfully', data: updatedPost });
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ message: 'Error updating post', error: error.message });
    }
  } 
  else if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ message: 'Post ID is required for deletion' });
      }

      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ message: 'Error deleting post', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
