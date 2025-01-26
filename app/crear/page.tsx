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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const session = await getSession();
      if (!session) {
        console.error('No hay sesión activa');
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append('nombre', nombre);
      formData.append('timestamp', timestamp);
      formData.append('lugar', lugar);
      if (session.user && session.user.email) {
        formData.append('organizador', session.user.email);
      } else {
        console.error('El usuario no tiene un email válido');
        setIsSubmitting(false);
        return;
      }
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
        console.error('Error al crear el evento');
      }
    } catch (error) {
      console.error('Error al crear el evento', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div>
        <label>Fecha y hora:</label>
        <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required />
      </div>
      <div>
        <label>Lugar:</label>
        <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} required />
      </div>
      <div>
        <label>Imagen:</label>
        <input type="file" onChange={(e) => setImagen(e.target.files?.[0] || null)} required />
      </div>
      <button type="submit" disabled={isSubmitting}>Crear Evento</button>
    </form>
  );
};

export default CrearEvento;