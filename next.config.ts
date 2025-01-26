import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Desactiva el modo estricto de React (si no lo necesitas en desarrollo)
  reactStrictMode: false,

  // Configuración de imágenes, especialmente si usas imágenes externas como Cloudinary
  images: {
    domains: ["res.cloudinary.com"], // Agrega aquí cualquier dominio necesario
  },

  // Variables de entorno para acceder desde el cliente y el servidor
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },

};

export default nextConfig;
