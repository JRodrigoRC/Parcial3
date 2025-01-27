import { NextRequest, NextResponse } from "next/server";
import Coordenada from "@/models/Coordenada";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "cloudinary";

// Configura Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear coordenadas" },
        { status: 401 }
      );
    }

    await connectDB();
    const formData = await req.formData();
    const nombre = formData.get("nombre") as string;
    const file = formData.get("imagen") as Blob | null;

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es obligatorio" },
        { status: 400 }
      );
    }

    // Geocodificación de la ubicación
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      nombre
    )}&format=json&limit=1`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (!geocodeData || geocodeData.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron coordenadas para la ubicación proporcionada" },
        { status: 400 }
      );
    }

    const { lat, lon } = geocodeData[0];

    // Subida de la imagen a Cloudinary (si existe)
    let imageUrl = "";
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Promesa para manejar la subida del flujo
      const uploadImage = (): Promise<{ secure_url: string }> => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.v2.uploader.upload_stream(
            { folder: "coordenadas", resource_type: "image" },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result as { secure_url: string });
              }
            }
          );
          stream.end(buffer);
        });
      };

      const uploadResult = await uploadImage();
      imageUrl = uploadResult.secure_url;
    }

    // Crear la nueva coordenada
    const coordenada = new Coordenada({
      nombre,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      creador: session.user.email,
      timestamp: new Date(),
      lugar: nombre,
      imagen: imageUrl,
    });

    await coordenada.save();
    return NextResponse.json(coordenada, { status: 201 });
  } catch (error) {
    console.error("Error al crear la coordenada:", error);
    return NextResponse.json(
      { error: "Error al crear la coordenada" },
      { status: 500 }
    );
  }
}
