import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScanner = () => {
  const [resultado, setResultado] = useState(null);
  const [escaneando, setEscaneando] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  const iniciarScanner = async () => {
    setResultado(null);
    setError(null);
    setEscaneando(true);

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" }, // cámara trasera
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (textoQR) => {
          // QR leído — detiene la cámara y valida
          await scanner.stop();
          setEscaneando(false);
          await validarQR(textoQR);
        },
        () => {} // error silencioso mientras busca el QR
      );
    } catch (err) {
      setError("No se pudo acceder a la cámara");
      setEscaneando(false);
    }
  };

  const detenerScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setEscaneando(false);
    }
  };

  const validarQR = async (qrEncriptado) => {
    try {
      const res = await fetch("http://localhost:3000/tickets/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qr: qrEncriptado }),
      });
      const data = await res.json();
      setResultado(data);
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };

  useEffect(() => {
    return () => {
      // limpia la cámara al salir del componente
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <h1 className="text-2xl font-bold">Escáner de Tickets</h1>

      {/* Área de la cámara */}
      <div id="qr-reader" className="w-72 h-72 rounded-xl overflow-hidden border-2 border-gray-300" />

      {/* Botones */}
      <div className="flex gap-4">
        {!escaneando ? (
          <button
            onClick={iniciarScanner}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Iniciar cámara
          </button>
        ) : (
          <button
            onClick={detenerScanner}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Detener
          </button>
        )}

        {resultado && (
          <button
            onClick={() => { setResultado(null); iniciarScanner(); }}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
          >
            Escanear otro
          </button>
        )}
      </div>

      {/* Resultado */}
      {resultado && (
        <div className={`w-full max-w-sm p-6 rounded-2xl text-center text-white text-xl font-bold shadow-lg
          ${resultado.estado === "valido" ? "bg-green-500" :
            resultado.estado === "usado" ? "bg-yellow-500" : "bg-red-500"}`}
        >
          {resultado.estado === "valido" && "✅ Acceso Permitido"}
          {resultado.estado === "usado" && "⚠️ Ticket Ya Usado"}
          {resultado.estado === "falso" && "❌ Ticket Inválido"}
          <p className="text-sm font-normal mt-2">{resultado.mensaje}</p>
          {resultado.usado_en && (
            <p className="text-sm font-normal">
              Usado el: {new Date(resultado.usado_en).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg w-full max-w-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default QRScanner;