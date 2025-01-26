import { NextRequest, NextResponse } from "next/server";
import Coordenada from "@/models/Coordenada";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para crear coordenadas" },
        { status: 401 }
      );
    }

    await connectDB();
    const { nombre } = await req.json();

    const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(nombre)}&format=json&limit=1`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData && geocodeData.length > 0) {
      const { lat, lon } = geocodeData[0];
      const coordenada = new Coordenada({
        nombre,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        creador: session.user.email,
        timestamp: new Date(),
        lugar: nombre,
        imagen: "", // Puedes agregar lógica para manejar imágenes si es necesario
      });

      await coordenada.save();
      return NextResponse.json(coordenada, { status: 201 });
    } else {
      return NextResponse.json(
        { error: "No se encontraron coordenadas para la ubicación proporcionada" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error al crear la coordenada:", error);
    return NextResponse.json(
      { error: "Error al crear la coordenada" },
      { status: 500 }
    );
  }
}