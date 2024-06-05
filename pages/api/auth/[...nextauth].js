import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToMongoDB from '../../../libs/mongodb';
import User from '../../../model/user';

export const runtime = 'edge';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Connect to MongoDB
        await connectToMongoDB(process.env.MONGODB_URI);

        // Find the user by username
        const user = await User.findOne({ username: credentials.username });
        if (!user) {
          throw new Error('No user found');
        }

        // Compare the provided password with the stored hashed password
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }

        // Return the user object
        return { id: user._id, username: user.username };
      },
    }),
  ],
  session: {
    jwt: true,
    maxAge: 60 * 10, // 10 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});
