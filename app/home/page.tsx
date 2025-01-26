"use client";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

interface Coordenada {
  _id: string;
  nombre: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
  timestamp: string;
  lugar: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);
  const [error, setError] = useState('');
  const [nombre, setNombre] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.email) {
      fetch(`/api/coordenadas?creador=${session.user.email}`)
        .then((response) => response.json())
        .then((data) => setCoordenadas(Array.isArray(data) ? data : []))
        .catch((error) => setError('Error al cargar las coordenadas'));
    }
  }, [status, session?.user?.email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!session?.user?.email) {
        throw new Error('No se ha encontrado el email del usuario');
      }

      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("creador", session.user.email);
      if (file) {
        formData.append("imagen", file);
      }

      const response = await fetch('/api/coordenadas', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newCoordenada = await response.json();
        setCoordenadas((prev) => [...prev, newCoordenada]);
        setNombre('');
        setFile(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al agregar la coordenada');
      }
    } catch (error) {
      setError('Error al agregar la coordenada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2>Bienvenido {session?.user?.name}</h2>
          <img src={session?.user?.image ?? undefined} alt={session?.user?.name ?? ""} className="w-20 h-20 rounded-full" />
          <button
            className="border border-solid border-black rounded px-4 py-2"
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                router.push("/");
              });
            }}
          >
            Sign Out
          </button>
        </div>
      );
    } else if (status === "loading") {
      return <span className="text-[#888] text-sm mt-7">Loading...</span>;
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded px-4 py-2 mb-8"
        >
          Sign In
        </Link>
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {showSession()}

      <div className="w-full max-w-xl mb-8">
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 mt-8">
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Introduce un país o ciudad"
            className="border border-solid border-black rounded px-4 py-2"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="border border-solid border-black rounded px-4 py-2"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Añadiendo...' : 'Añadir marcador'}
          </button>
        </form>
      </div>

      <div className="w-full h-64 mb-8">
        <Map location={{ lat: coordenadas[0]?.lat || 0, lon: coordenadas[0]?.lon || 0 }} coordenadas={coordenadas} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {coordenadas.map((coordenada) => (
          <Link href={`/eventos/${coordenada._id}`} key={coordenada._id}>
            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={coordenada.imagen} 
                alt={coordenada.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h2 className="font-bold text-xl mb-2">{coordenada.nombre}</h2>
                <p className="text-gray-600">
                  {new Date(coordenada.timestamp).toLocaleDateString()}
                </p>
                <p className="text-gray-600">{coordenada.lugar}</p>
                <p className="text-gray-600">Organizador: {coordenada.creador}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
