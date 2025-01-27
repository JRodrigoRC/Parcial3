import { NextRequest, NextResponse } from "next/server";
import Coordenada from "@/models/Coordenada";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    await connectDB();

    if (lat && lon) {
      const coordenadas = await Coordenada.find({
        lat: { $gte: Number(lat) - 0.2, $lte: Number(lat) + 0.2 },
        lon: { $gte: Number(lon) - 0.2, $lte: Number(lon) + 0.2 },
      }).sort({ timestamp: 1 });
      
      return NextResponse.json(coordenadas);
    }

    const coordenadas = await Coordenada.find({}).sort({ timestamp: 1 });
    return NextResponse.json(coordenadas);
  } catch (error) {
    console.error("Error al obtener coordenadas:", error);
    return NextResponse.json(
      { error: "Error al obtener coordenadas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verificar sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear coordenadas" },
        { status: 401 }
      );
    }

    // 2. Conectar a la base de datos
    await connectDB();

    // 3. Obtener datos del formulario
    const formData = await req.formData();
    const titulo = formData.get("titulo") as string;
    const nombre = formData.get("nombre") as string;
    const file = formData.get("imagen") as Blob | null;


    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre de la ubicación es obligatorio" },
        { status: 400 }
      );
    }

    // 4. Obtener coordenadas de geocodificación
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      nombre
    )}&format=json&limit=1`;

    const geocodeResponse = await fetch(geocodeUrl);

    if (!geocodeResponse.ok) {
      console.error("Error al contactar el servicio de geocodificación.");
      return NextResponse.json(
        { error: "Error al obtener coordenadas de geocodificación" },
        { status: 500 }
      );
    }

    const geocodeData = await geocodeResponse.json();

    if (!geocodeData || geocodeData.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron coordenadas para la ubicación proporcionada" },
        { status: 400 }
      );
    }

    const { lat, lon } = geocodeData[0];

    // 5. Subir imagen a Cloudinary (si existe)
    let imageUrl = "";
    if (file) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
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

        imageUrl = uploadResult.secure_url;
      } catch (cloudinaryError) {
        console.error("Error al subir la imagen a Cloudinary:", cloudinaryError);
        return NextResponse.json(
          { error: "Error al subir la imagen" },
          { status: 500 }
        );
      }
    }

    // 6. Crear nueva coordenada en la base de datos
    const coordenada = new Coordenada({
      titulo,
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
    console.error("Error general al procesar la solicitud:", error);
    return NextResponse.json(
      { error: "Ocurrió un error inesperado al procesar la solicitud" },
      { status: 500 }
    );
  }
}