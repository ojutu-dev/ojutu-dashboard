

import connectToMongoDB from '../../../libs/mongodb';
import Portfolio from '../../../model/portfolio';
import Brand from '../../../model/brand';
import Keywords from '../../../model/keywords';
import Service from '../../../model/service';
import { parseForm } from '../../../libs/parseForm';
import { uploadBuffer } from '../../../libs/uploadBuffer';
import cors from '../../../libs/cors';
import cloudinary from '../../../libs/cloudinary';

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

  if (req.method === 'GET') {
    try {
      let portfolio;

      if (slug) {
        portfolio = await Portfolio.findOne({ slug })
          .populate('service', 'title')
          .populate('brand', 'title')
          .populate('keywords', 'title');
      } else if (id) {
        portfolio = await Portfolio.findById(id)
          .populate('service', 'title')
          .populate('brand', 'title')
          .populate('keywords', 'title');
      } else {
        const portfolios = await Portfolio.find()
          .populate('brand')
          .populate('service')
          .populate('keywords')
          .select('_id title ogdescription mainImage slug');

        return res.status(200).json({
          success: true,
          count: portfolios.length,
          data: portfolios,
        });
      }

      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }

      res.status(200).json(portfolio);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      res.status(500).json({ message: 'Error fetching portfolios', error: error.message });
    }

  } else if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const { fields, files } = await parseForm(req);

      const {
        title, company, slug, address, ogdescription, body,
        serviceId, brandId, keywords
      } = fields;

      const keywordArray = typeof keywords === 'string' ? keywords.split(',') : keywords;

      const brand = await Brand.findById(brandId);
      const service = await Service.findById(serviceId);
      const keywordsData = await Keywords.find({ _id: { $in: keywordArray } });

      if (!brand) throw new Error('Invalid brand ID');
      if (!service) throw new Error('Invalid service ID');
      if (!keywordsData.length) throw new Error('Invalid keywords');

      const uploadOrKeepImage = async (imageFile, existingUrl) => {
        if (!imageFile) return existingUrl || null;
        return await uploadBuffer(imageFile.buffer, 'portfolio', imageFile.originalFilename);
      };

      const mainImageUrl = await uploadOrKeepImage(files.mainImage, fields.mainImage);
      const headerImageUrl = await uploadOrKeepImage(files.headerImage, fields.headerImage);
      const otherImageUrl = await uploadOrKeepImage(files.otherImage, fields.otherImage);
      const ogImageUrl = await uploadOrKeepImage(files.ogImage, fields.ogImage);

      const data = {
        title,
        company,
        slug,
        address,
        ogdescription,
        body,
        service: serviceId,
        brand: brandId,
        keywords: keywordArray,
        mainImage: mainImageUrl,
        headerImage: headerImageUrl,
        otherImage: otherImageUrl,
        ogImage: ogImageUrl,
      };

      if (req.method === 'POST') {
        const newPortfolio = new Portfolio(data);
        await newPortfolio.save();
        res.status(201).json({ success: true, data: newPortfolio });
      } else {
        const updatedPortfolio = await Portfolio.findByIdAndUpdate(id, data, {
          new: true,
          runValidators: true,
        });

        if (!updatedPortfolio) {
          return res.status(404).json({ message: 'Portfolio not found' });
        }

        res.status(200).json({ success: true, data: updatedPortfolio });
      }
    } catch (error) {
      console.error(`${req.method} error:`, error);
      res.status(500).json({ message: `Error ${req.method === 'POST' ? 'creating' : 'updating'} portfolio`, error: error.message });
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
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}


// export default async function handler(req, res) {
//   await connectToMongoDB(process.env.MONGODB_URI);
//   await cors(req, res);

//   const { id, slug} = req.query;
//   if (req.method === 'GET') {
//     try {
//       let portfolio; 
//       if (slug) {
//         portfolio = await Portfolio.findOne({ slug })
//           .populate('service', 'title')
//           .populate('brand', 'title')
//           .populate('keywords', 'title');
//       } else if (id) {
//         portfolio = await Portfolio.findById(id)
//           .populate('service', 'name')
//           .populate('brand', 'name')
//           .populate('keywords', 'name');
//       } else {
//         portfolio = await Portfolio.find()
//           .populate('brand')
//           .populate('service')
//           .populate('keywords')
//           .select('_id title ogdescription mainImage slug');

//         return res.status(200).json({
//           success: true,
//           count: portfolio.length,
//           data: portfolio,
//         });
//       }

//       if (!portfolio) {
//         return res.status(404).json({ message: 'Portfolio not found' });
//       }

//       res.status(200).json(portfolio);
//     } catch (error) {
//       console.error('Error fetching portfolios:', error);
//       res.status(500).json({ message: 'Error fetching portfolios', error: error.message });
//     }
//   }  else if (req.method === 'POST') {
//     const { title, company, slug, address, ogdescription, body, serviceId, brandId, keywords, mainImage, headerImage, otherImage, ogImage } = req.body;

//     try {
//       const brand = await Brand.findById(brandId);
//       const keywordsData = await Keywords.find({ _id: { $in: keywords } });
//       const service = await Service.findById(serviceId);

//       if (!brand) {
//         throw new Error('Invalid brand ID');
//       }
//       if (!keywordsData.length) {
//         throw new Error('Invalid keywords');
//       }
//       if (!service) {
//         throw new Error('Invalid service ID');
//       }

//       const uploadBase64Image = async (base64Image) => {
//         if (base64Image) {
//           const uploadResult = await cloudinary.uploader.upload(base64Image, { folder: 'ojutu' });
//           return uploadResult.secure_url;
//         }
//         return null;
//       };

//       const [mainImageUrl, headerImageUrl, otherImageUrl, ogImageUrl] = await Promise.all([
//         mainImage ? uploadBase64Image(mainImage) : null,
//         headerImage ? uploadBase64Image(headerImage) : null,
//         otherImage ? uploadBase64Image(otherImage) : null,
//         ogImage ? uploadBase64Image(ogImage) : null,
//       ]);

//       const newPortfolio = new Portfolio({
//         title,
//         company,
//         slug,
//         address,
//         ogdescription,
//         body,
//         service: serviceId,
//         brand: brandId,
//         keywords,
//         mainImage: mainImageUrl,
//         headerImage: headerImageUrl,
//         otherImage: otherImageUrl,
//         ogImage: ogImageUrl,
//       });

//       await newPortfolio.save();
//       res.status(201).json({ success: true, data: newPortfolio });
//     } catch (error) {
//       console.error('Error creating portfolio:', error);
//       res.status(500).json({ message: 'Error creating portfolio', error: error.message });
//     }
//   }else if (req.method === 'PUT') {
//     try {
//       const { title, company, slug, serviceId, address, brandId, mainImage, headerImage, otherImage, ogImage, ogdescription, keywords, body } = req.body;

//       const uploadImage = async (image) => {
//         if (image && image.startsWith('data:image')) {
//           const uploadResult = await cloudinary.uploader.upload(image, { folder: 'portfolio' });
//           return uploadResult.secure_url;
//         }
//         return image;
//       };

//       const [mainImageUrl, headerImageUrl, otherImageUrl, ogImageUrl] = await Promise.all([
//         uploadImage(mainImage),
//         uploadImage(headerImage),
//         uploadImage(otherImage),
//         uploadImage(ogImage),
//       ]);

//       const updatedPortfolio = await Portfolio.findByIdAndUpdate(
//         id,
//         {
//           title,
//           company,
//           slug,
//           service: serviceId,
//           address,
//           brand: brandId,
//           mainImage: mainImageUrl,
//           headerImage: headerImageUrl,
//           otherImage: otherImageUrl,
//           ogImage: ogImageUrl,
//           ogdescription,
//           keywords,
//           body,
//         },
//         { new: true, runValidators: true }
//       );

//       if (!updatedPortfolio) {
//         return res.status(404).json({ message: 'Portfolio not found' });
//       }
//       res.status(200).json(updatedPortfolio);
//     } catch (error) {
//       res.status(500).json({ message: 'Error updating portfolio', error: error.message });
//     }
//   } else if (req.method === 'DELETE') {
//     try {
//       const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
//       if (!deletedPortfolio) {
//         return res.status(404).json({ message: 'Portfolio not found' });
//       }
//       res.status(200).json({ message: 'Portfolio deleted' });
//     } catch (error) {
//       res.status(500).json({ message: 'Error deleting portfolio', error: error.message });
//     }
//   }  else {
//     res.status(405).json({ message: 'Method not allowed' });
//   } 
// }
