'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

const CrearEvento = () => {
  const [nombre, setNombre] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [lugar, setLugar] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!nombre || !timestamp || !lugar) {
      setError('Todos los campos son obligatorios');
      setIsSubmitting(false);
      return;
    }

    try {
      const session = await getSession();
      if (!session) {
        setError('Debes iniciar sesión para crear un evento');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('timestamp', timestamp);
      formData.append('lugar', lugar);
      if (imagen) {
        formData.append('imagen', imagen);
      }

      const res = await fetch('/api/eventos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Error al crear el evento');
      }
    } catch (err) {
      setError('Error al crear el evento. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Crear Evento</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Nombre:</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Fecha y hora:</label>
          <input
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Lugar:</label>
          <input
            type="text"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium">Imagen:</label>
          <input
            type="file"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className={`w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creando...' : 'Crear Evento'}
        </button>
      </form>
    </div>
  );
};

export default CrearEvento;
