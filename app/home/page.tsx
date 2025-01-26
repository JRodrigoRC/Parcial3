"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "next-auth/react";

const CrearEvento = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    timestamp: '',
    lugar: '',
    imagen: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const session = await getSession();
      if (!session || !session.user?.email) {
        throw new Error('No hay sesión activa o email del usuario no encontrado');
      }

      const body = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) body.append(key, value as any);
      });
      body.append('organizador', session.user.email);

      const res = await fetch('/api/eventos', {
        method: 'POST',
        body,
      });

      if (res.ok) {
        router.push('/');
      } else {
        throw new Error('Error al crear el evento');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      {['nombre', 'timestamp', 'lugar'].map((field) => (
        <div key={field} className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <input
            type={field === 'timestamp' ? 'datetime-local' : 'text'}
            name={field}
            value={(formData as any)[field]}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
      ))}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Imagen</label>
        <input
          type="file"
          name="imagen"
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creando...' : 'Crear Evento'}
      </button>
    </form>
  );
};

export default CrearEvento;
