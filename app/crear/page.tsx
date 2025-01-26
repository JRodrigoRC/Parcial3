'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';

const CrearEvento = () => {
  const [nombre, setNombre] = useState('');
  const [timestamp, setTimestamp] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Formato para "datetime-local"
  });
  const [lugar, setLugar] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validateInputs = () => {
    if (!nombre || !timestamp || !lugar) {
      return 'Todos los campos son obligatorios';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validación de entradas
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Verificar sesión
      const session = await getSession();
      if (!session) {
        setError('Debes iniciar sesión para crear un evento');
        setIsSubmitting(false);
        return;
      }

      // Crear el objeto FormData
      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('timestamp', timestamp);
      formData.append('lugar', lugar);
      if (imagen) {
        formData.append('imagen', imagen);
      }

      // Enviar datos al servidor
      const res = await fetch('/api/eventos', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.push('/'); // Redirigir a la página principal
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
          <label htmlFor="nombre" className="block font-medium">
            Nombre:
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="timestamp" className="block font-medium">
            Fecha y hora:
          </label>
          <input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="lugar" className="block font-medium">
            Lugar:
          </label>
          <input
            id="lugar"
            type="text"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="imagen" className="block font-medium">
            Imagen:
          </label>
          <input
            id="imagen"
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
