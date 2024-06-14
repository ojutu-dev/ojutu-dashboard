// import connectToMongoDB from '../../../libs/mongodb';
// import Author from '../../../model/author';
// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export default async function handler(req, res) {
//   await connectToMongoDB(process.env.MONGODB_URI);

//   if (req.method === 'GET') {
//     try {
//       const authors = await Author.find();
//       res.status(200).json({success: true, data:authors});
//     } catch (error) {
//       res.status(500).json({ message: 'Error fetching authors', error });
//     }
//   } else if (req.method === 'POST') {
//     try {
//       const { name, image, slug, description } = req.body;

//       const uploadedImage = await cloudinary.uploader.upload(image, {
//         folder: 'ojutu',
//       });

//       const newAuthor = new Author({
//         name,
//         image: uploadedImage.secure_url,
//         slug,
//         description,
//       });
//       await newAuthor.save();
//       res.status(201).json(newAuthor);
//     } catch (error) {
//       res.status(500).json({ message: 'Error creating author', error });
//     }
//   }  else {
//     res.status(405).json({ message: 'Method not allowed' });
//   }
// }


import connectToMongoDB from '../../../libs/mongodb';
import Author from '../../../model/author';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const author = await Author.findById(id);
      if (!author) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
      res.status(200).json({ success: true, data: author });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching author', error });
    }
  } else if (req.method === 'POST') {
    try {
      const { name, image, slug, description } = req.body;

      const uploadedImage = await cloudinary.uploader.upload(image, {
        folder: 'ojutu',
      });

      const newAuthor = new Author({
        name,
        image: uploadedImage.secure_url,
        slug,
        description,
      });
      await newAuthor.save();
      res.status(201).json(newAuthor);
    } catch (error) {
      res.status(500).json({ message: 'Error creating author', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { name, image, slug, description } = req.body;

      const updatedAuthorData = { name, slug, description };

      if (image) {
        const uploadedImage = await cloudinary.uploader.upload(image, {
          folder: 'ojutu',
        });
        updatedAuthorData.image = uploadedImage.secure_url;
      }

      const updatedAuthor = await Author.findByIdAndUpdate(id, updatedAuthorData, { new: true });
      if (!updatedAuthor) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }

      res.status(200).json({ success: true, data: updatedAuthor });
    } catch (error) {
      res.status(500).json({ message: 'Error updating author', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedAuthor = await Author.findByIdAndDelete(id);
      if (!deletedAuthor) {
        return res.status(404).json({ success: false, message: 'Author not found' });
      }
      res.status(204).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting author', error });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
