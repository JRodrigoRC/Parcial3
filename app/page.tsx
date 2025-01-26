'use client';//
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
//
export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

  if (status === 'loading') {
    return <p>Cargando...</p>;
  }

  if (status === 'authenticated') {
    router.push('/home');
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 mb-8">
      <h1>Bienvenido a MiMapa</h1>
      <h2>Inicia sesión para continuar</h2>
      <button
        className="border border-solid border-black rounded px-4 py-2"
        onClick={() => signIn()}
      >
        Sign In
      </button>
    </div>
  );
}