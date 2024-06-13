// import connectToMongoDB from '../../../libs/mongodb';
import connectToMongoDB from '../../libs/mongodb';
import Portfolio from '../../model/portfolio';
import Brand from '../../model/brand';
import Keywords from '../../model/keywords';
import Service from '../../model/service';
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
      const portfolios = await Portfolio.find().populate('brand').populate('service').populate('keywords');
      res.status(200).json({ success: true, data: portfolios });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching portfolios', error });
    }
  } else if (req.method === 'POST') {
    const {
      title,
      company,
      slug,
      address,
      ogdescription,
      body,
      category,
      brand,
      keywords,
      featuredImage,
      headerImage,
      mainImage,
      otherImage,
      ogImage,
    } = req.body;

    try {
      let featuredImageUrl, headerImageUrl, mainImageUrl, otherImageUrl, ogImageUrl;

      if (featuredImage) {
        const uploadResponse = await cloudinary.uploader.upload(featuredImage, { folder: 'portfolio' });
        featuredImageUrl = uploadResponse.secure_url;
      }

      if (headerImage) {
        const uploadResponse = await cloudinary.uploader.upload(headerImage, { folder: 'portfolio' });
        headerImageUrl = uploadResponse.secure_url;
      }

      if (mainImage) {
        const uploadResponse = await cloudinary.uploader.upload(mainImage, { folder: 'portfolio' });
        mainImageUrl = uploadResponse.secure_url;
      }

      if (otherImage) {
        const uploadResponse = await cloudinary.uploader.upload(otherImage, { folder: 'portfolio' });
        otherImageUrl = uploadResponse.secure_url;
      }

      if (ogImage) {
        const uploadResponse = await cloudinary.uploader.upload(ogImage, { folder: 'portfolio' });
        ogImageUrl = uploadResponse.secure_url;
      }

      const newPortfolio = new Portfolio({
        title,
        company,
        slug,
        address,
        ogdescription,
        body,
        category,
        brand,
        keywords,
        featuredImage: featuredImageUrl,
        headerImage: headerImageUrl,
        mainImage: mainImageUrl,
        otherImage: otherImageUrl,
        ogImage: ogImageUrl,
      });

      await newPortfolio.save();
      res.status(201).json({ success: true, data: newPortfolio });
    } catch (error) {
      res.status(500).json({ message: 'Error creating portfolio', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}