import connectToMongoDB from '../../../libs/mongodb';
import Portfolio from '../../../model/portfolio';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const portfolio = await Portfolio.findById(id)
        .populate('category')
        .populate('brand')
        .populate('keywords');
      if (!portfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(portfolio);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching portfolio', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, company, slug, serviceId, address, brandId, logo, mainImage, headerImage, otherImage, ogImage, ogdescription, keywordsId, body } = req.body;
      const updatedPortfolio = await Portfolio.findByIdAndUpdate(
        id,
        { title, company, slug, service:serviceId, address, brand:brandId, logo, mainImage, headerImage, otherImage, ogImage, ogdescription, keywords:keywordsId, body },
        { new: true, runValidators: true }
      );
      if (!updatedPortfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json(updatedPortfolio);
    } catch (error) {
      res.status(500).json({ message: 'Error updating portfolio', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedPortfolio = await Portfolio.findByIdAndDelete(id);
      if (!deletedPortfolio) {
        return res.status(404).json({ message: 'Portfolio not found' });
      }
      res.status(200).json({ message: 'Portfolio deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting portfolio', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
