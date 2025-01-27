"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CrearPelicula() {
  const { data: session } = useSession();
  const [titulo, setTitulo] = useState('');
  const [cartel, setCartel] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!session?.user?.email) {
      setError('Debes iniciar sesión para crear una película.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      if (cartel) {
        formData.append('cartel', cartel);
      }

      const response = await fetch('/api/peliculas', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la película.');
      }

      setTitulo('');
      setCartel(null);
      alert('Película creada exitosamente.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold mb-4">Crear Película</h1>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título de la película"
        className="border border-gray-300 p-2 rounded w-full"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setCartel(e.target.files?.[0] || null)}
        className="border border-gray-300 p-2 rounded w-full"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando...' : 'Crear Película'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
