"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CrearSala() {
  const { data: session } = useSession();
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
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
    formData.append("nombre", nombre);
    formData.append("direccion", direccion);

    try {
      const response = await fetch("/api/coordenadas", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        router.push("/");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al crear la sala.");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-8">
      <h1 className="text-2xl font-bold mb-8">Crear Sala</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la sala"
          className="border rounded px-4 py-2"
          required
        />
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección"
          className="border rounded px-4 py-2"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {isSubmitting ? "Creando..." : "Crear"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </main>
  );
}
