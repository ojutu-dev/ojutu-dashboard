import connectToMongoDB from '../../../libs/mongodb';
import Portfolio from '../../../model/portfolio';
import Brand from '../../../model/brand';
import Keywords from '../../../model/keywords';
import Service from '../../../model/service';
import { v2 as cloudinary } from 'cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  
  maxDuration: 10,
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  if (req.method === 'GET') {
    try {
      const portfolios = await Portfolio.find().populate('brand').populate('service').populate('keywords');
       // Map over the portfolios and extract only the needed fields
       const response = portfolios.map(portfolio => ({
        _id: portfolio._id,     
        title: portfolio.title,
        mainImage: portfolio.mainImage
      }));
      res.status(200).json({ 
        success: true,
        data: response 
      
      });
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      res.status(500).json({ message: 'Error fetching portfolios', error });
    }
  } else if (req.method === 'POST') {
    const { title, company, slug, address, ogdescription, body, serviceId, brandId, keywords, mainImage, headerImage, otherImage, ogImage } = req.body;
    
    try {
      const brand = await Brand.findById(brandId);
      const keywordsData = await Keywords.find({ _id: { $in: keywords } });
      const service = await Service.findById(serviceId);

      if (!brand) {
        throw new Error('Invalid brand ID');
      }
      if (!keywordsData.length) {
        throw new Error('Invalid keywords');
      }
      if (!service) {
        throw new Error('Invalid service ID');
      }

      const convertToBase64 = (imageBuffer) => {
        if (imageBuffer) {
          const base64Image = Buffer.from(imageBuffer).toString('base64');
          const mimeType = 'image/jpeg'; // You can adjust the mime type based on the actual image type
          return `data:${mimeType};base64,${base64Image}`;
        }
        return null;
      };

      const uploadBase64Image = async (imageBuffer) => {
        const base64Image = convertToBase64(imageBuffer);
        if (base64Image) {
          const uploadResult = await cloudinary.uploader.upload(base64Image, { folder: 'ojutu' });
          return uploadResult.secure_url;
        }
        return null;
      };

      const [mainImageUrl, headerImageUrl, otherImageUrl, ogImageUrl] = await Promise.all([
        mainImage ? uploadBase64Image(mainImage) : null,
        headerImage ? uploadBase64Image(headerImage) : null,
        otherImage ? uploadBase64Image(otherImage) : null,
        ogImage ? uploadBase64Image(ogImage) : null,
      ]);

      const newPortfolio = new Portfolio({
        title,
        company,
        slug,
        address,
        ogdescription,
        body,
        service: serviceId,
        brand: brandId,
        keywords,
        mainImage: mainImageUrl,
        headerImage: headerImageUrl,
        otherImage: otherImageUrl,
        ogImage: ogImageUrl,
      });

      await newPortfolio.save();
      res.status(201).json({ success: true, data: newPortfolio });
    } catch (error) {
      console.error('Error creating portfolio:', error);
      res.status(500).json({ message: 'Error creating portfolio', error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
