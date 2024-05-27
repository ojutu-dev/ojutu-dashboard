import connectToMongoDB from '../../../libs/mongodb';
import Service from '../../../model/service';

export default async function handler(req, res) {
  await connectToMongoDB(process.env.MONGODB_URI);

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const service = await Service.findById(id);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(service);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching service', error });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, description } = req.body;
      const updatedService = await Service.findByIdAndUpdate(
        id,
        { title, description },
        { new: true, runValidators: true }
      );
      if (!updatedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json(updatedService);
    } catch (error) {
      res.status(500).json({ message: 'Error updating service', error });
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedService = await Service.findByIdAndDelete(id);
      if (!deletedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      res.status(200).json({ message: 'Service deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting service', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
