import { useState } from 'react';

export default function TicketQR({ ticketData }) {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generarQR = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:3000/tickets/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQr(data.qr);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button
        onClick={generarQR}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generando...' : 'Generar QR'}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {qr && (
        <div className="flex flex-col items-center gap-2">
          <img src={qr} alt="QR del ticket" className="w-48 h-48" />
          <a
            href={qr}
            download="ticket-qr.png"
            className="text-sm text-blue-500 underline"
          >
            Descargar QR
          </a>
        </div>
      )}
    </div>
  );
}