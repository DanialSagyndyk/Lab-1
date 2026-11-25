import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, logout, error } = useAuth();
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setBusy(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setBusy(false);
    }
  }

  // Guard against null user during route transitions or state updates
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const initial = (
    user.displayName?.charAt(0) ||
    user.email?.charAt(0) ||
    "U"
  ).toUpperCase();

  const providers =
    user.providerData && user.providerData.length > 0
      ? user.providerData.map((p) => p.providerId).join(", ")
      : "Email/Password";

  return (
    <section className="page">
      <small>ACCOUNT</small>
      <h1>Your profile</h1>
      <p>You are successfully authenticated with Firebase.</p>

      <div className="profile-card">
        <div className="avatar" style={{ overflow: "hidden" }}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User avatar"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initial
          )}
        </div>
        <div>
          <h2>{user.displayName || "ProductHub user"}</h2>
          <p>
            <b>Email</b>
            <br />
            {user.email || "No email associated"}
          </p>
          <p>
            <b>Firebase UID</b>
            <br />
            <code>{user.uid}</code>
          </p>
          <p>
            <b>Provider</b>
            <br />
            {providers}
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <button
        type="button"
        className="btn"
        onClick={handleLogout}
        disabled={busy}
      >
        {busy ? "Signing out…" : "Logout"}
      </button>
    </section>
  );
}
