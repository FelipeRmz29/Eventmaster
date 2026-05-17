import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { Badge, Button, Card, SectionHeader } from "../components/ui.jsx";
import { verifyTicket } from "../services/tickets";

const RESULT_COPY = {
  valid: {
    title: "BOLETO VALIDO",
    message: "Boleto valido. Acceso permitido.",
  },
  used: {
    title: "BOLETO YA UTILIZADO",
    message: "Este boleto ya fue usado.",
  },
  invalid: {
    title: "BOLETO INVALIDO",
    message: "Boleto invalido o no encontrado.",
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
    () =>
      sessionStorage.getItem("eventmaster_verifier_code") ||
      localStorage.getItem("eventmaster_verifier_code") ||
      ""
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

  const vibrateForStatus = (status) => {
    if (!navigator.vibrate) return;

    navigator.vibrate(status === "valid" ? [100] : [100, 50, 100]);
  };

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
      vibrateForStatus(verification.status);
    } catch (error) {
      setResult({
        status: "error",
        message: error.message || RESULT_COPY.error.message,
      });
      vibrateForStatus("error");
    } finally {
      validatingRef.current = false;
      setIsLoading(false);
    }
  };

  const startScanner = async () => {
    if (!accessCode.trim()) {
      setResult({
        status: "error",
        message: "Ingresa el codigo de acceso del personal.",
      });
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setResult({
        status: "error",
        message: "Este navegador no soporta acceso a la camara.",
      });
      return;
    }

    sessionStorage.setItem("eventmaster_verifier_code", accessCode.trim());
    localStorage.removeItem("eventmaster_verifier_code");
    stopScanner();
    setResult(null);
    setCameraMessage("Solicitando permiso de camara...");
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
      setCameraMessage("Apunta la camara al codigo QR del boleto.");
    } catch (error) {
      setIsScanning(false);
      controlsRef.current = null;
      setCameraMessage("");
      setResult({
        status: "error",
        message:
          error.name === "NotAllowedError"
            ? "Permiso de camara denegado."
            : "No se pudo iniciar la camara.",
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
    <main className="page-container verifier-page">
      <section className="verifier-shell">
        <SectionHeader
          eyebrow="EventMaster · Verificacion"
          title="Verificacion de boletos"
          description="Escanea el QR del boleto para validar el acceso desde celular o navegador."
        />

        <Card className="verifier-card">
          <div className="verifier-topline">
            <Badge tone="info">PWA mobile-first</Badge>
            <span>Camara trasera preferida</span>
          </div>

          <label className="ui-field verifier-code">
            <span>Codigo de acceso</span>
            <input
              type="password"
              value={accessCode}
              onChange={(event) => setAccessCode(event.target.value)}
              placeholder="Codigo del personal"
              autoComplete="current-password"
            />
          </label>

          <div className="scanner-frame">
            <video
              ref={videoRef}
              className={`scanner-video ${isScanning ? "active" : ""}`}
              muted
              playsInline
            />

            {isScanning ? (
              <>
                <div className="scanner-target" aria-hidden="true" />
                <div className="scanner-line" aria-hidden="true" />
              </>
            ) : (
              <div className="scanner-placeholder">
                <img src="/illustrations/scanner-qr-illustration.png" alt="" aria-hidden="true" />
                <span>QR</span>
              </div>
            )}
          </div>

          {cameraMessage && <p className="scanner-status">{cameraMessage}</p>}

          <div className="button-group verifier-actions">
            {!isScanning ? (
              <Button onClick={startScanner} loading={isLoading} disabled={isLoading}>
                Escanear QR
              </Button>
            ) : (
              <Button variant="ghost" onClick={stopScanner}>
                Cancelar
              </Button>
            )}

            <Button variant="secondary" onClick={resetScanner}>
              Escanear otro boleto
            </Button>
          </div>

          {resultCopy && (
            <div className={`verification-result ${resultCopy.status}`}>
              <strong>{resultCopy.title}</strong>
              <p>{resultCopy.message}</p>
              {result?.ticket && (
                <dl className="ticket-safe-data">
                  <div>
                    <dt>Ticket</dt>
                    <dd>{result.ticket.id}</dd>
                  </div>
                  <div>
                    <dt>Evento</dt>
                    <dd>{result.ticket.evento_id || "N/D"}</dd>
                  </div>
                  <div>
                    <dt>Asiento</dt>
                    <dd>{result.ticket.asiento_id || "N/D"}</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </Card>
      </section>
    </main>
  );
}

export default TicketVerifier;
