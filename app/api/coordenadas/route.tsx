// Importaciones comunes
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import Pelicula from "@/models/Pelicula";
import Sala from "@/models/Sala";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Crear película
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear una película" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const titulo = formData.get("titulo") as string;
    const cartel = formData.get("cartel") as Blob | null;

    if (!titulo) {
      return NextResponse.json(
        { error: "El título de la película es obligatorio" },
        { status: 400 }
      );
    }

    // Subir cartel a Cloudinary
    let cartelUrl = "";
    if (cartel) {
      try {
        const buffer = Buffer.from(await cartel.arrayBuffer());
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "peliculas", resource_type: "image" },
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

        cartelUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error al subir el cartel a Cloudinary:", cloudinaryError);
        return NextResponse.json(
          { error: "Error al subir el cartel" },
          { status: 500 }
        );
      }
    }

    const pelicula = new Pelicula({
      titulo,
      cartel: cartelUrl,
      propietario: session.user.email,
      timestamp: new Date(),
    });

    await pelicula.save();

    return NextResponse.json(pelicula, { status: 201 });
  } catch (error) {
    console.error("Error al crear la película:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al crear la película" },
      { status: 500 }
    );
  }
}

// Crear sala
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear una sala" },
        { status: 401 }
      );
    }

    await connectDB();

    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const direccion = formData.get("direccion") as string;

    if (!nombre || !direccion) {
      return NextResponse.json(
        { error: "El nombre y la dirección de la sala son obligatorios" },
        { status: 400 }
      );
    }

    const sala = new Sala({
      nombre,
      direccion,
      propietario: session.user.email,
      timestamp: new Date(),
    });

    await sala.save();

    return NextResponse.json(sala, { status: 201 });
  } catch (error) {
    console.error("Error al crear la sala:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al crear la sala" },
      { status: 500 }
    );
  }
}