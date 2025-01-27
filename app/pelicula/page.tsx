"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CrearPelicula() {
  const { data: session } = useSession();
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [cartel, setCartel] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!session?.user) {
      setError("Debes iniciar sesión para continuar.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("titulo", titulo);
    if (cartel) {
      formData.append("cartel", cartel);
    }

    try {
      const response = await fetch("/api/peliculas", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear la película.");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-8">Crear Película</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título de la película"
          className="border rounded px-4 py-2"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCartel(e.target.files?.[0] || null)}
          className="border rounded px-4 py-2"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {isSubmitting ? "Creando..." : "Crear"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </main>
  );
}
