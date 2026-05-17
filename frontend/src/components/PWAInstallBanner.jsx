import { useEffect, useState } from "react";
import { Button } from "./ui.jsx";

const STORAGE_KEY = "eventmaster_pwa_install_dismissed";

function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    let timerId;

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);

      if (!dismissed) {
        timerId = window.setTimeout(() => setIsVisible(true), 30000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    setIsVisible(false);
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible || !installPrompt) return null;

  return (
    <aside className="pwa-install-banner" role="status">
      <div>
        <strong>Instala EventMaster</strong>
        <span>Acceso rapido a eventos, boletos y verificacion QR.</span>
      </div>
      <Button size="sm" onClick={handleInstall}>Instalar</Button>
      <button className="pwa-dismiss" type="button" onClick={handleDismiss} aria-label="Cerrar">
        x
      </button>
    </aside>
  );
}

export default PWAInstallBanner;
