import { useEffect, useState } from "react";

export default function PWAStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [registration, setRegistration] = useState(null);
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [cachedData, setCachedData] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onBeforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const onMessage = (event) => {
      if (event.data?.type === "PWA_CACHED_RESPONSE") {
        setCachedData(true);
        window.setTimeout(() => setCachedData(false), 5000);
      }
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    navigator.serviceWorker?.addEventListener("message", onMessage);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).then((reg) => {
        setRegistration(reg);
        if (reg.waiting) setWaitingWorker(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setWaitingWorker(worker);
            }
          });
        });
      }).catch((error) => console.error("Service worker registration failed:", error));

      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (window.__pwaReloading) return;
        window.__pwaReloading = true;
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      navigator.serviceWorker?.removeEventListener("message", onMessage);
    };
  }, []);

  async function activateUpdate() {
    if (waitingWorker) waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }
  async function installApp() {
    if (!installPrompt) return;
    await installPrompt.prompt();
    setInstallPrompt(null);
  }

  return (
    <div className="pwa-status" aria-live="polite">
      <span className={`connection-dot ${online ? "is-online" : "is-offline"}`} />
      <span>{online ? "Online" : "Offline"}</span>
      {cachedData && <span className="cache-label">Viewing cached data</span>}
      {!online && <a className="offline-link" href="/offline">Offline help</a>}
      {installPrompt && <button className="pwa-action install-action" onClick={installApp}>Install app</button>}
      {waitingWorker && <button className="pwa-action" onClick={activateUpdate}>Update available · Reload</button>}
    </div>
  );
}
