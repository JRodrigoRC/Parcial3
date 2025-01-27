import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-8">Gestión de Películas y Salas</h1>
      <div className="flex gap-8">
        <Link href="/crear-pelicula" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Película
        </Link>
        <Link href="/crear-sala" className="bg-green-500 text-white px-4 py-2 rounded">
          Crear Sala
        </Link>
      </div>
    </main>
  );
}

