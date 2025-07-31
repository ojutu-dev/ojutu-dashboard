

// pages/api/posts/index.js
import connectToMongoDB from '../../../libs/mongodb';
import Post from '../../../model/post';
import Author from '../../../model/author';
import Category from '../../../model/category';
import { parseForm } from '../../../libs/parseForm';
import { uploadBuffer } from '../../../libs/uploadBuffer';
import cloudinary from '../../../libs/cloudinary';
import cors from '../../../libs/cors';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);
  await cors(req, res);
  const { id, slug } = req.query;

  if (req.method === 'POST') {
    try {
      const { fields, files } = await parseForm(req);
      const { title, description, slug, body, authorId, categoryId } = fields;

      const author = await Author.findById(authorId);
      const category = await Category.findById(categoryId);
      if (!author || !category) return res.status(400).json({ message: 'Invalid author or category' });

      const featuredImageUrl = files.featuredImage
        ? await uploadBuffer(files.featuredImage.buffer, 'ojutu', files.featuredImage.filename)
        : null;

      const headerImageUrl = files.headerImage
        ? await uploadBuffer(files.headerImage.buffer, 'ojutu', files.headerImage.filename)
        : null;

      const ogImageUrl = files.ogImage
        ? await uploadBuffer(files.ogImage.buffer, 'ojutu', files.ogImage.filename)
        : null;

      const post = new Post({
        title,
        description,
        slug,
        body,
        author: authorId,
        category: categoryId,
        featuredImage: featuredImageUrl,
        headerImage: headerImageUrl,
        ogImage: ogImageUrl,
      });

      await post.save();
      res.status(201).json({ success: true, data: post });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Failed to create post', error: err.message });
    }
  } else if (req.method === 'GET') {
    try {
      let post;
      if (slug) {
        post = await Post.findOne({ slug }).populate('author', 'name email image').populate('category', 'title');
      } else if (id) {
        post = await Post.findById(id).populate('author', 'name email image').populate('category', 'title');
      } else {
        const posts = await Post.find().populate('author', 'name email')
        .populate('category', 'title')
        .select('_id title slug description featuredImage createdAt')
        .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, count: result.length, data: result });
      }

      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.status(200).json({ success: true, data: post });
    } catch (err) {
      res.status(500).json({ message: 'Fetch failed', error: err.message });
    }
  } else if (req.method === 'PUT') {
    try {
      if (!id) return res.status(400).json({ message: 'Missing post ID' });

      const { fields, files } = await parseForm(req);
      const { title, description, slug, body, authorId, categoryId } = fields;

      const featuredImageUrl = files.featuredImage
        ? await uploadBuffer(files.featuredImage.buffer, 'ojutu', files.featuredImage.filename)
        : undefined;

      const headerImageUrl = files.headerImage
        ? await uploadBuffer(files.headerImage.buffer, 'ojutu', files.headerImage.filename)
        : undefined;

      const ogImageUrl = files.ogImage
        ? await uploadBuffer(files.ogImage.buffer, 'ojutu', files.ogImage.filename)
        : undefined;

      const updateFields = {
        title, description, slug, body,
        author: authorId,
        category: categoryId,
        ...(featuredImageUrl && { featuredImage: featuredImageUrl }),
        ...(headerImageUrl && { headerImage: headerImageUrl }),
        ...(ogImageUrl && { ogImage: ogImageUrl }),
      };

      const updatedPost = await Post.findByIdAndUpdate(id, updateFields, {
        new: true, runValidators: true
      });

      if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

      res.status(200).json({ success: true, data: updatedPost });
    } catch (err) {
      console.error('PUT error:', err);
      res.status(500).json({ message: 'Update failed', error: err.message });
    }
  }

  else if (req.method === 'DELETE') {
    try {
      if (!id) return res.status(400).json({ message: 'Missing post ID' });

      const deletedPost = await Post.findByIdAndDelete(id);
      if (!deletedPost) return res.status(404).json({ message: 'Post not found' });

      res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (err) {
      res.status(500).json({ message: 'Delete failed', error: err.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}



// GET request
// const handleGet = async (req, res, { id, slug }) => {
//   let result;
//   if (slug) {
//     result = await Post.findOne({ slug })
//       .populate('author', 'name email image')
//       .populate('category', 'title');
//   } else if (id) {
//     result = await Post.findById(id)
//       .populate('author', 'name email image')
//       .populate('category', 'title');
//   } else {
//     result = await Post.find()
//       .populate('author', 'name email')
//       .populate('category', 'title')
//       .select('_id title slug description featuredImage createdAt');
//     return res.status(200).json({ success: true, count: result.length, data: result });
//   }

//   if (!result) return res.status(404).json({ message: 'Post not found' });
//   return res.status(200).json(result);
// };





// export default async function handler(req, res) {
//   await connectToMongoDB(process.env.MONGODB_URI);
//   await cors(req, res);

//   const { id, slug } = req.query;

//   if (req.method === 'GET') {
//     try {
//       let posts;

//       if (slug) {
//         posts = await Post.findOne({ slug })
//           .populate('author', 'name email image')
//           .populate('category', 'title');
//       } else if (id) {
//         posts = await Post.findById(id)
//           .populate('author', 'name email image')
//           .populate('category', 'title');
//       } else {
//         posts = await Post.find()
//           .populate('author', 'name email')
//           .populate('category', 'title')
//           .select('_id title slug description featuredImage createdAt');

//         return res.status(200).json({
//           success: true,
//           count: posts.length,
//           data: posts
//         });
//       }

//       if (!posts) {
//         return res.status(404).json({ message: 'Post not found' });
//       }

//       res.status(200).json(posts);
//     } catch (error) {
//       console.error('Error fetching posts:', error);
//       res.status(500).json({ message: 'Error fetching posts', error: error.message });
//     }
//   }  else if (req.method === 'POST') {
//     const { title, description, slug, featuredImage, authorId, body, headerImage, ogImage, categoryId } = req.body;
//     try {
//       const author = await Author.findById(authorId);
//       const category = await Category.findById(categoryId);

//       if (!author) {
//         throw new Error(`Author with ID ${authorId} not found`);
//       }

//       if (!category) {
//         throw new Error(`Category with ID ${categoryId} not found`);
//       }

//       const uploadBase64Image = async (base64Image) => {
//         if (base64Image) {
//           try {
//             const uploadResult = await cloudinary.uploader.upload(base64Image, { folder: 'ojutu' });
//             return uploadResult.secure_url;
//           } catch (uploadError) {
//             console.error('Error uploading image to Cloudinary:', uploadError);
//             throw uploadError;
//           }
//         }
//         return null;
//       };

//       const [featuredImageUrl, headerImageUrl, ogImageUrl] = await Promise.all([
//         uploadBase64Image(featuredImage),
//         uploadBase64Image(headerImage),
//         uploadBase64Image(ogImage),
//       ]);

//       const post = new Post({
//         title,
//         slug,
//         description,
//         featuredImage: featuredImageUrl,
//         headerImage: headerImageUrl,
//         ogImage: ogImageUrl,
//         body,
//         author: authorId,
//         category: categoryId,
//       });

//       await post.save();
//       res.status(201).json(post);
//     } catch (error) {
//       console.error('Error creating post:', error.stack);
//       res.status(500).json({ message: 'Error creating post', error: error.message });
//     }
//   } else if (req.method === 'PUT') {
//     try {
//       if (!id) {
//         return res.status(400).json({ message: 'Post ID is required for update' });
//       }

//       const { title, description, slug, featuredImage, headerImage, ogImage, body, authorId, categoryId } = req.body;

//       const uploadImage = async (image) => {
//         if (image && image.startsWith('data:image')) {
//           const uploadResult = await cloudinary.uploader.upload(image, { folder: 'ojutu' });
//           return uploadResult.secure_url;
//         }
//         return image;
//       };

//       const [featuredImageUrl, headerImageUrl, ogImageUrl] = await Promise.all([
//         uploadImage(featuredImage),
//         uploadImage(headerImage),
//         uploadImage(ogImage),
//       ]);

//       const updatedPost = await Post.findByIdAndUpdate(
//         id,
//         {
//           title,
//           slug,
//           description,
//           featuredImage: featuredImageUrl,
//           headerImage: headerImageUrl,
//           ogImage: ogImageUrl,
//           body,
//           author: authorId,
//           category: categoryId,
//         },
//         { new: true, runValidators: true }
//       ).select('_id title slug description featuredImage headerImage ogImage body createdAt');

//       if (!updatedPost) {
//         return res.status(404).json({ message: 'Post not found' });
//       }
//       res.status(200).json({ success: true, message: 'Post updated successfully', data: updatedPost });
//     } catch (error) {
//       console.error('Error updating post:', error);
//       res.status(500).json({ message: 'Error updating post', error: error.message });
//     }
//   } 
//   else if (req.method === 'DELETE') {
//     try {
//       if (!id) {
//         return res.status(400).json({ message: 'Post ID is required for deletion' });
//       }

//       const deletedPost = await Post.findByIdAndDelete(id);
//       if (!deletedPost) {
//         return res.status(404).json({ message: 'Post not found' });
//       }
//       res.status(200).json({ success: true, message: 'Post deleted successfully' });
//     } catch (error) {
//       console.error('Error deleting post:', error);
//       res.status(500).json({ message: 'Error deleting post', error: error.message });
//     }
//   } else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }
