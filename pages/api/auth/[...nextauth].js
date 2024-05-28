import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectToMongoDB from '../../../libs/mongodb';
import User from '../../../model/user';
import bcrypt from 'bcryptjs';

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        await connectToMongoDB(process.env.MONGODB_URI);

        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error('No user found with the email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return { id: user._id, username: user.username, email: user.email };
      }
    })
  ],
  session: {
    jwt: true,
    maxAge: 10 * 60,  // 10 minutes
    updateAge: 10 * 60,  // Force update every 10 minutes to refresh expiry
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async session(session, token) {
      session.user = token.user;
      return session;
    }
  }
});
