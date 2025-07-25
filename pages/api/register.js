import connectToMongoDB from '../../libs/mongodb';
import User from '../../model/user';
import bcrypt from 'bcryptjs';
import cors from '../../libs/cors';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, email, password } = req.body;

      await connectToMongoDB(process.env.MONGODB_URI);
      await cors(req, res);
      

      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email or username already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      await newUser.save();

      return res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
      return res.status(500).json({ message: 'An error occurred while registering the user.', error });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}