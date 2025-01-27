"use client";

import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

interface Coordenada {
  _id: string;
  nombre: string;
  lat: number;
  lon: number;
  creador: string;
  imagen: string;
  timestamp: string;
}

export default function Sala() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cargar coordenadas al cargar la página
    if (status === "authenticated") {
      fetch("/api/coordenadas")
        .then((response) => response.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCoordenadas(data);
          } else {
            setError("Error al cargar las coordenadas");
          }
        })
        .catch(() => setError("Error al cargar las coordenadas"));
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

      <h1 className="text-2xl font-bold mb-6">Mapa de Coordenadas</h1>

      {error && <div className="text-red-500">{error}</div>}

      <div className="w-full h-[500px] mb-8">
        {coordenadas.length > 0 ? (
          <Map
            location={{
              lat: coordenadas[0]?.lat || 0,
              lon: coordenadas[0]?.lon || 0,
            }}
            coordenadas={coordenadas}
          />
        ) : (
          <p className="text-gray-600">No hay coordenadas para mostrar.</p>
        )}
      </div>
    </main>
  );
}

