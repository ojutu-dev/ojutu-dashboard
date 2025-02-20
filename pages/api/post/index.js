import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';
import Author from '../../../model/author';
import Category from '../../../model/category';
import cloudinary from '../../../libs/cloudinary';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const posts = await Post.find()
      .populate('author')
      .populate('category')
      .select('_id title description slug featuredImage authorId categoryId ogImage');
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  } else if (req.method === 'POST') {
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
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
