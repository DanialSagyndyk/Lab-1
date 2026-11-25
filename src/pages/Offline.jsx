import { Link } from "react-router-dom";
export default function Offline() {
  return <section className="page offline-page"><div className="offline-symbol">⌁</div><small>PRODUCTHUB · OFFLINE MODE</small><h1>You're currently offline</h1><p>Some pages may not be available yet. Previously loaded catalogue data and product details are kept on this device.</p><p className="offline-state">Check your connection, then retry.</p><div><button className="btn" onClick={() => window.location.reload()}>Retry connection</button><Link className="btn light" to="/">Go to home</Link></div></section>;
}
