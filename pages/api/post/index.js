import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';
import Author from '../../../model/author';
import Category from '../../../model/category';
import { v2 as cloudinary } from 'cloudinary';


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const posts = await Post.find().populate('author').populate('category');
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching posts', error });
    }
  } else if (req.method === 'POST') {
    
    const { title, description, slug, featuredImage, authorId, body, headerImage, ogImage, categoryId } = req.body;
    try {

      const author = await Author.findById(authorId);
      const category = await Category.findById(categoryId);


       const featuredImageUrl = await cloudinary.uploader.upload(featuredImage, {
        folder: 'ojutu',
        
      });

      const ogImageUrl = await cloudinary.uploader.upload(ogImage, {
        folder: 'ojutu',
        
      });
      const headerImageUrl = await cloudinary.uploader.upload(headerImage, {
        folder: 'ojutu',
        
      });
  
      
        const post = new Post({
        title,
        slug,
        description,
        featuredImage: featuredImageUrl.secure_url,
        headerImage:headerImageUrl.secure_url,
        ogImage:ogImageUrl.secure_url,
        body,
        author: authorId,
        category: categoryId,
      });
      // console.log(featuredImageUrl)
      
      await post.save();

      res.status(201).json(post);
  
    } catch (error) {
      res.status(500).json({ message: 'Error creating post', error });
      console.error('Error uploading image:', error);
      console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
