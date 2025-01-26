import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import type { NextAuthOptions } from "next-auth";
import credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import LoginLog from "@/models/LoginLog";

export const authOptions: NextAuthOptions = {
  providers: [
    credentials({
      name: "Credentials",
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({
          email: credentials?.email,
        }).select("+password");

        if (!user) {
          throw new Error("Email no encontrado");
        }

        const isValid = await bcrypt.compare(credentials!.password, user.password);
        if (!isValid) {
          throw new Error("ContraseÃ±a incorrecta");
        }

        return user;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      async profile(profile) {
        await connectDB();
        let user = await User.findOne({ email: profile.email });

        if (!user) {
          user = new User({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
          });
          await user.save();
        } else {
          user.image = profile.picture; // Actualiza la imagen si ya existe el usuario
          await user.save();
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user}) {
        try {
            // Crear registro del login
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 24); // Token válido por 24h
        
            const loginLog = new LoginLog({
              userEmail: user.email,
              expiryTimestamp: expiryDate,
              token: user.id // O puedes generar un token único
            });
        
            await loginLog.save();
            return true;
          } catch (error) {
            console.error("Error al registrar login:", error);
            return true; // Permitir login aunque falle el registro
          }
       
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, token }) {  // Cambiado para recibir token en lugar de user
      if (token) {
        session.user = {
          ...session.user,
          name: token.name,
          email: token.email,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
};
;