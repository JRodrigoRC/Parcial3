"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface LoginLog {
  timestamp: string;
  userEmail: string;
  expiryTimestamp: string;
  token: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      const response = await fetch('/api/logs');
      const data = await response.json();
      setLogs(data.sort((a: LoginLog, b: LoginLog) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    }
    fetchLogs();
  }, []);

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Login Logs</h1>
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded">
          Volver
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Usuario</th>
              <th className="border p-2">Caducidad</th>
              <th className="border p-2">Token</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="border p-2">{log.userEmail}</td>
                <td className="border p-2">{new Date(log.expiryTimestamp).toLocaleString()}</td>
                <td className="border p-2">{log.token}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}