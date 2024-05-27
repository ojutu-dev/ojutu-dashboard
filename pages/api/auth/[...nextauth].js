// NextAuth configuration
import connectToMongoDB  from "../../../libs/mongodb";
import User from "../../../model/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        username: { label: "Username", type: "username" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        await connectToMongoDB(process.env.MONGODB_URI);

        // const { username, password } = credentials;

        try {
          const user = await User.findOne({ email: credentials.email});

          if (user) {

            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              return user;
          }

         
        } 
      } catch (error) {
          console.error("Error: ", error);
          throw new Error("An error occurred during authentication", error);
        }
      },
    }),
  ],
 
};

const handler = NextAuth(authOptions);

export default handler;
