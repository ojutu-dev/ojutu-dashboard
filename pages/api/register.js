import connectToMongoDB from '../../libs/mongodb';
import User from '../../model/user';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, email, password } = req.body;

      // Ensure MongoDB connection
      await connectToMongoDB(process.env.MONGODB_URI);

      // Check if user with the same email already exists
      const existingUser = await User.findOne( { email}, {username });
      if (existingUser) {
        return res.status(400).json({ message: "User with this email or username already exists." });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      await User.create({ username, email, password: hashedPassword });

      return res.status(201).json({ message: "User registered successfully." });
    } catch (error) {
      console.error("Error registering user:", error);
      return res.status(500).json({ message: "An error occurred while registering the user.", error });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}