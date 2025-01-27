"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Pelicula {
  _id: string;
  titulo: string;
  cartel: string;
  propietario: string;
  timestamp: string;
}

export default function CrearPelicula() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [peliculas, setPeliculas] = useState<Pelicula[]>([]);
  const [error, setError] = useState("");

  // Cargar películas al cargar la página
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/peliculas")
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setPeliculas(data);
          } else {
            setError("Error al cargar las películas");
          }
        })
        .catch(() => setError("Error al cargar las películas"));
    }
  }, [status]);

  // Mostrar sesión de usuario
  const showSession = () => {
    if (status === "authenticated") {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2>Bienvenido {session?.user?.name}</h2>
          <img
            src={session?.user?.image ?? undefined}
            alt={session?.user?.name ?? ""}
            className="w-20 h-20 rounded-full"
          />
          <button
            className="border border-solid border-black rounded px-4 py-2"
            onClick={() => {
              signOut({ redirect: false }).then(() => {
                router.push("/");
              });
            }}
          >
            Cerrar sesión
          </button>
        </div>
      );
    } else if (status === "loading") {
      return <span className="text-[#888] text-sm mt-7">Cargando...</span>;
    } else {
      return (
        <Link
          href="/login"
          className="border border-solid border-black rounded px-4 py-2 mb-8"
        >
          Iniciar sesión
        </Link>
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      {showSession()}

      <h1 className="text-2xl font-bold mb-6">Películas disponibles</h1>

      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {peliculas.map((pelicula) => (
          <div
            key={pelicula._id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={pelicula.cartel || "/placeholder.png"}
              alt={pelicula.titulo}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{pelicula.titulo}</h2>
              <p className="text-gray-600">Subido por: {pelicula.propietario}</p>
              <p className="text-gray-600">
                {new Date(pelicula.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
