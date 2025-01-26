import { NextResponse } from "next/server";
import Coordenada from "@/models/Coordenada";
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

// Validador simple para los datos de entrada
const validateInputs = (data: { nombre?: string; timestamp?: string; lugar?: string }) => {
  const errors = [];
  if (!data.nombre) errors.push("El nombre es obligatorio.");
  if (!data.timestamp) errors.push("El timestamp es obligatorio.");
  if (!data.lugar) errors.push("El lugar es obligatorio.");
  return errors;
};

// Obtener coordenada por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const coordenada = await Coordenada.findById(id);

    if (!coordenada) {
      return NextResponse.json({ error: "Coordenada no encontrada" }, { status: 404 });
    }

    return NextResponse.json(coordenada);
  } catch (error) {
    console.error("Error al obtener la coordenada:", error);
    return NextResponse.json({ error: "Error al obtener la coordenada" }, { status: 500 });
  }
}

// Crear nueva coordenada
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    // Validar entradas
    const validationErrors = validateInputs({ nombre, timestamp, lugar });
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 });
    }

    // Procesar imagen si se proporciona
    let imagenUrl = "";
    if (imagen) {
      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const response = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "image", folder: "coordenadas" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(buffer);
        });
        imagenUrl = (response as { secure_url: string }).secure_url;
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        return NextResponse.json(
          { error: "No se pudo subir la imagen. Intenta nuevamente." },
          { status: 500 }
        );
      }
    }

    // Obtener coordenadas del lugar
    let lat = 0;
    let lon = 0;
    try {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        lugar
      )}&format=json&limit=1`;

      const geocodeResponse = await fetch(geocodeUrl);
      const geocodeData = await geocodeResponse.json();

      if (geocodeData && geocodeData.length > 0) {
        lat = parseFloat(geocodeData[0].lat);
        lon = parseFloat(geocodeData[0].lon);
      }
    } catch (error) {
      console.error("Error al obtener las coordenadas del lugar:", error);
      return NextResponse.json(
        { error: "No se pudo obtener la ubicación del lugar. Intenta nuevamente." },
        { status: 500 }
      );
    }

    // Crear coordenada en la base de datos
    await connectDB();
    const nuevaCoordenada = await Coordenada.create({
      nombre,
      timestamp,
      lugar,
      lat,
      lon,
      imagen: imagenUrl,
      creador: session.user.email,
    });

    return NextResponse.json(nuevaCoordenada, { status: 201 });
  } catch (error) {
    console.error("Error al crear la coordenada:", error);
    return NextResponse.json({ error: "Error al crear la coordenada" }, { status: 500 });
  }
}

// Actualizar coordenada existente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const coordenada = await Coordenada.findById(id);
    if (!coordenada) {
      return NextResponse.json({ error: "Coordenada no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario es el creador
    if (coordenada.creador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const nombre = formData.get("nombre") as string;
    const timestamp = formData.get("timestamp") as string;
    const lugar = formData.get("lugar") as string;
    const imagen = formData.get("imagen") as File;

    // Validar entradas
    const validationErrors = validateInputs({ nombre, timestamp, lugar });
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(", ") }, { status: 400 });
    }

    // Procesar nueva imagen si se proporciona
    let imagenUrl = coordenada.imagen;
    if (imagen) {
      try {
        const bytes = await imagen.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const response = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "image", folder: "coordenadas" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(buffer);
        });
        imagenUrl = (response as { secure_url: string }).secure_url;
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        return NextResponse.json(
          { error: "No se pudo subir la imagen. Intenta nuevamente." },
          { status: 500 }
        );
      }
    }

    // Obtener coordenadas del lugar si cambió
    let lat = coordenada.lat;
    let lon = coordenada.lon;
    if (lugar && lugar !== coordenada.lugar) {
      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          lugar
        )}&format=json&limit=1`;

        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData && geocodeData.length > 0) {
          lat = parseFloat(geocodeData[0].lat);
          lon = parseFloat(geocodeData[0].lon);
        }
      } catch (error) {
        console.error("Error al obtener las coordenadas del lugar:", error);
        return NextResponse.json(
          { error: "No se pudo obtener la ubicación del lugar. Intenta nuevamente." },
          { status: 500 }
        );
      }
    }

    const coordenadaActualizada = await Coordenada.findByIdAndUpdate(
      id,
      {
        nombre,
        timestamp,
        lugar,
        lat,
        lon,
        imagen: imagenUrl,
      },
      { new: true }
    );

    return NextResponse.json(coordenadaActualizada);
  } catch (error) {
    console.error("Error al actualizar la coordenada:", error);
    return NextResponse.json(
      { error: "Error al actualizar la coordenada" },
      { status: 500 }
    );
  }
}

// Eliminar coordenada existente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const coordenada = await Coordenada.findById(id);
    if (!coordenada) {
      return NextResponse.json({ error: "Coordenada no encontrada" }, { status: 404 });
    }

    // Verificar que el usuario es el creador
    if (coordenada.creador !== session.user.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    await Coordenada.findByIdAndDelete(id);
    return NextResponse.json({ message: "Coordenada eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar la coordenada:", error);
    return NextResponse.json(
      { error: "Error al eliminar la coordenada" },
      { status: 500 }
    );
  }
}