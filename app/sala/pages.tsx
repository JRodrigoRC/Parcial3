"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

export default function CrearSala() {
  const { data: session } = useSession();
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!session?.user?.email) {
      setError('Debes iniciar sesión para crear una sala.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('direccion', direccion);

      const response = await fetch('/api/salas', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear la sala.');
      }

      setNombre('');
      setDireccion('');
      alert('Sala creada exitosamente.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold mb-4">Crear Sala</h1>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre de la sala"
        className="border border-gray-300 p-2 rounded w-full"
        required
      />
      <input
        type="text"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        placeholder="Dirección de la sala"
        className="border border-gray-300 p-2 rounded w-full"
        required
      />
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando...' : 'Crear Sala'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
}
