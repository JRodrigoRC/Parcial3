"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const showSession = () => {
    if (status === "authenticated") {
      return (
        <div className="flex flex-col items-center gap-4 mb-8">
          <h2>Bienvenido, {session?.user?.name}</h2>
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
    <main className="flex flex-col items-center p-8">
      {showSession()}

      <h1 className="text-3xl font-bold mb-8">Gestión de Películas y Salas</h1>
      <div className="flex gap-8">
        <Link href="/pelicula" className="bg-blue-500 text-white px-4 py-2 rounded">
          Crear Película
        </Link>
        <Link href="/sala" className="bg-green-500 text-white px-4 py-2 rounded">
          Crear Sala
        </Link>
      </div>
    </main>
  );
}
