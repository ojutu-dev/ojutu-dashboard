import connectToMongoDB from '../../../libs/mongodb';
import Portfolio from '../../../model/portfolio';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
  
  maxDuration: 50000,
}

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
      const portfolio = await Portfolio.findById(id).populate('service').populate('brand').populate('keywords');
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(portfolio);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching portfolio', error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, company, slug, serviceId, address, brandId, mainImage, headerImage, otherImage, ogImage, ogdescription, keywords, body } = req.body;

      const uploadImage = async (image) => {
        if (image && image.startsWith('data:image')) {
          const uploadResult = await cloudinary.uploader.upload(image, { folder: 'portfolio' });
          return uploadResult.secure_url;
        }
        return image;
      };

      const [mainImageUrl, headerImageUrl, otherImageUrl, ogImageUrl] = await Promise.all([
        uploadImage(mainImage),
        uploadImage(headerImage),
        uploadImage(otherImage),
        uploadImage(ogImage),
      ]);

      const updatedPortfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
          title,
          company,
          slug,
          service: serviceId,
          address,
          brand: brandId,
          mainImage: mainImageUrl,
          headerImage: headerImageUrl,
          otherImage: otherImageUrl,
          ogImage: ogImageUrl,
          ogdescription,
          keywords,
          body,
        },
        { new: true, runValidators: true }
      );

      if (!updatedPortfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(updatedPortfolio);
    } catch (error) {
      res.status(500).json({ message: 'Error updating portfolio', error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
      if (!deletedPortfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json({ message: 'Portfolio deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting portfolio', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}