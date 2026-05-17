import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Badge, Button, Card, SectionHeader } from '../components/ui.jsx';
import { verifyTicket } from '../services/tickets';

const RESULT_COPY = {
  valid:   { title: 'BOLETO VÁLIDO',          message: 'Acceso permitido.' },
  used:    { title: 'BOLETO YA UTILIZADO',     message: 'Este boleto ya fue usado.' },
  invalid: { title: 'BOLETO INVÁLIDO',         message: 'Boleto inválido o no encontrado.' },
  error:   { title: 'ERROR',                   message: 'No se pudo verificar el boleto.' },
  loading: { title: 'VALIDANDO',               message: 'Consultando el estado del boleto...' },
};

function TicketVerifier() {
  const videoRef       = useRef(null);
  const controlsRef    = useRef(null);
  const validatingRef  = useRef(false);
  const lastScanRef    = useRef({ token: '', scannedAt: 0 });

  const [isScanning,     setIsScanning]     = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [cameraMessage,  setCameraMessage]  = useState('');
  const [result,         setResult]         = useState(null);

  const hasToken = !!localStorage.getItem('adminToken');

  useEffect(() => {
    return () => { controlsRef.current?.stop(); };
  }, []);

  const stopScanner = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setIsScanning(false);
  };

  const vibrateForStatus = (status) => {
    if (!navigator.vibrate) return;
    navigator.vibrate(status === 'valid' ? [100] : [100, 50, 100]);
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
    setCameraMessage('');
    setResult({ status: 'loading' });

    controls?.stop();
    controlsRef.current = null;
    setIsScanning(false);

    try {
      const verification = await verifyTicket(token);
      setResult(verification);
      vibrateForStatus(verification.status);
    } catch (error) {
      setResult({ status: 'error', message: error.message });
      vibrateForStatus('error');
    } finally {
      validatingRef.current = false;
      setIsLoading(false);
    }
  };

  const startScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setResult({ status: 'error', message: 'Este navegador no soporta acceso a la cámara.' });
      return;
    }

    stopScanner();
    setResult(null);
    setCameraMessage('Solicitando permiso de cámara...');
    setIsScanning(true);

    try {
      const codeReader = new BrowserQRCodeReader();
      const controls = await codeReader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: 'environment' } } },
        videoRef.current,
        (scanResult, scanError, scanControls) => {
          if (scanResult) handleScanResult(scanResult.getText(), scanControls);
        }
      );
      controlsRef.current = controls;
      setCameraMessage('Apunta la cámara al código QR del boleto.');
    } catch (error) {
      setIsScanning(false);
      controlsRef.current = null;
      setCameraMessage('');
      setResult({
        status: 'error',
        message: error.name === 'NotAllowedError'
          ? 'Permiso de cámara denegado.'
          : 'No se pudo iniciar la cámara.',
      });
    }
  };

  const resetScanner = () => {
    stopScanner();
    validatingRef.current = false;
    setIsLoading(false);
    setCameraMessage('');
    setResult(null);
  };

  const resultCopy = result
    ? { ...(RESULT_COPY[result.status] || RESULT_COPY.error), ...result }
    : null;

  // Sin token: pedir login primero
  if (!hasToken) {
    return (
      <main className="page-container verifier-page">
        <section className="verifier-shell">
          <SectionHeader
            eyebrow="EventMaster · Verificación"
            title="Verificación de boletos"
            description="Se requiere sesión de administrador para escanear boletos."
          />
          <Card className="verifier-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-soft)' }}>
              Debes iniciar sesión como admin antes de usar el escáner.
            </p>
            <Link to="/login" className="main-button">Iniciar sesión</Link>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="page-container verifier-page">
      <section className="verifier-shell">
        <SectionHeader
          eyebrow="EventMaster · Verificación"
          title="Verificación de boletos"
          description="Escanea el QR del boleto para validar el acceso."
        />

        <Card className="verifier-card">
          <div className="verifier-topline">
            <Badge tone="info">PWA mobile-first</Badge>
            <span>Cámara trasera preferida</span>
          </div>

          <div className="scanner-frame">
            <video
              ref={videoRef}
              className={`scanner-video ${isScanning ? 'active' : ''}`}
              muted
              playsInline
            />
            {isScanning ? (
              <>
                <div className="scanner-target" aria-hidden="true" />
                <div className="scanner-line"  aria-hidden="true" />
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
              <Button variant="ghost" onClick={stopScanner}>Cancelar</Button>
            )}
            <Button variant="secondary" onClick={resetScanner}>Escanear otro boleto</Button>
          </div>

          {resultCopy && (
            <div className={`verification-result ${resultCopy.status}`}>
              <strong>{resultCopy.title}</strong>
              <p>{resultCopy.message}</p>
              {result?.ticket && (
                <dl className="ticket-safe-data">
                  <div><dt>Ticket ID</dt><dd>{result.ticket.id}</dd></div>
                  <div><dt>Comprador</dt><dd>{result.ticket.nombre_comprador || 'N/D'}</dd></div>
                  <div><dt>Evento</dt><dd>{result.ticket.evento || 'N/D'}</dd></div>
                  <div><dt>Asiento</dt><dd>{result.ticket.asiento || 'N/D'}</dd></div>
                  <div><dt>Zona</dt><dd>{result.ticket.zona || 'N/D'}</dd></div>
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
