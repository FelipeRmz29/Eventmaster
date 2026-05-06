import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { verifyTicket } from "../services/tickets";

const RESULT_COPY = {
  valid: {
    title: "VÁLIDO",
    message: "Boleto válido. Acceso permitido.",
  },
  used: {
    title: "USADO",
    message: "Este boleto ya fue usado.",
  },
  invalid: {
    title: "FALSO / INVÁLIDO",
    message: "Boleto inválido o no encontrado.",
  },
  error: {
    title: "ERROR",
    message: "No se pudo verificar el boleto.",
  },
  loading: {
    title: "VALIDANDO",
    message: "Consultando el estado del boleto...",
  },
};

const getResultCopy = (result) => {
  if (!result) return null;

  const fallback = RESULT_COPY.error;
  const copy = RESULT_COPY[result.status] || fallback;

  return {
    title: copy.title,
    message: result.message || copy.message,
    status: result.status || "error",
  };
};

function TicketVerifier() {
  const videoRef = useRef(null);
  const controlsRef = useRef(null);
  const validatingRef = useRef(false);
  const lastScanRef = useRef({ token: "", scannedAt: 0 });

  const [accessCode, setAccessCode] = useState(
    () => localStorage.getItem("eventmaster_verifier_code") || ""
  );
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraMessage, setCameraMessage] = useState("");
  const [result, setResult] = useState(null);

  const stopScanner = () => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (controlsRef.current) {
        controlsRef.current.stop();
        controlsRef.current = null;
      }
    };
  }, []);

  const handleScanResult = async (rawToken, controls) => {
    const token = rawToken?.trim();

    if (!token || validatingRef.current) return;

    const now = Date.now();
    const isDuplicate =
      lastScanRef.current.token === token &&
      now - lastScanRef.current.scannedAt < 2000;

    if (isDuplicate) return;

    lastScanRef.current = { token, scannedAt: now };
    validatingRef.current = true;
    setIsLoading(true);
    setCameraMessage("");
    setResult({ status: "loading" });

    controls?.stop();
    controlsRef.current = null;
    setIsScanning(false);

    try {
      const verification = await verifyTicket(token, accessCode.trim());
      setResult(verification);
    } catch (error) {
      setResult({
        status: "error",
        message: error.message || RESULT_COPY.error.message,
      });
    } finally {
      validatingRef.current = false;
      setIsLoading(false);
    }
  };

  const startScanner = async () => {
    if (!accessCode.trim()) {
      setResult({
        status: "error",
        message: "Ingresa el código de acceso del personal.",
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setResult({
        status: "error",
        message: "Este navegador no soporta acceso a la cámara.",
      });
      return;
    }

    localStorage.setItem("eventmaster_verifier_code", accessCode.trim());
    stopScanner();
    setResult(null);
    setCameraMessage("Solicitando permiso de cámara...");
    setIsScanning(true);

    try {
      const codeReader = new BrowserQRCodeReader();
      const controls = await codeReader.decodeFromConstraints(
        {
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        },
        videoRef.current,
        (scanResult, scanError, scanControls) => {
          if (scanError) return;

          if (scanResult) {
            handleScanResult(scanResult.getText(), scanControls);
          }
        }
      );

      controlsRef.current = controls;
      setCameraMessage("Apunta la cámara al código QR del boleto.");
    } catch (error) {
      setIsScanning(false);
      controlsRef.current = null;
      setCameraMessage("");
      setResult({
        status: "error",
        message:
          error.name === "NotAllowedError"
            ? "Permiso de cámara denegado."
            : "No se pudo iniciar la cámara.",
      });
    }
  };

  const resetScanner = () => {
    stopScanner();
    validatingRef.current = false;
    setIsLoading(false);
    setCameraMessage("");
    setResult(null);
  };

  const resultCopy = getResultCopy(result);

  return (
    <div className="page-container verifier-page">
      <section className="verifier-shell">
        <div className="brand-block">
          <h1>Verificación de boletos</h1>
          <p>Escanea el QR del boleto para validar el acceso.</p>
        </div>

        <div className="verifier-card">
          <div className="form-group verifier-code">
            <label>Código de acceso</label>
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Código del personal"
              autoComplete="current-password"
            />
          </div>

          <div className="scanner-frame">
            <video
              ref={videoRef}
              className={`scanner-video ${isScanning ? "active" : ""}`}
              muted
              playsInline
            />

            {isScanning ? (
              <div className="scanner-target" aria-hidden="true" />
            ) : (
              <div className="scanner-placeholder">
                <span>QR</span>
              </div>
            )}
          </div>

          {cameraMessage && (
            <p className="scanner-status">{cameraMessage}</p>
          )}

          <div className="button-group verifier-actions">
            {!isScanning ? (
              <button
                className="main-button"
                onClick={startScanner}
                disabled={isLoading}
              >
                {isLoading ? "Validando..." : "Escanear QR"}
              </button>
            ) : (
              <button className="main-button ghost" onClick={stopScanner}>
                Cancelar
              </button>
            )}

            <button className="main-button secondary" onClick={resetScanner}>
              Escanear otro boleto
            </button>
          </div>

          {resultCopy && (
            <div className={`verification-result ${resultCopy.status}`}>
              <strong>{resultCopy.title}</strong>
              <p>{resultCopy.message}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TicketVerifier;
