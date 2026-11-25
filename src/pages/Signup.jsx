import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
  const {
    user,
    signup,
    googleLogin,
    error,
    clearError,
    loading,
    firebaseReady,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  if (loading) return <p className="loading">Checking session…</p>;
  if (user) return <Navigate to="/profile" replace />;

  async function submit(e) {
    e.preventDefault();
    clearError();
    setLocalError("");

    if (password.length < 6) {
      setLocalError("Password must contain at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setLocalError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await signup(email, password);
      navigate("/profile", { replace: true });
    } catch {
      // error is handled and displayed via AuthContext
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    clearError();
    setLocalError("");
    setBusy(true);
    try {
      await googleLogin();
      navigate("/profile", { replace: true });
    } catch {
      // error is handled and displayed via AuthContext
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login">
      <small>JOIN PRODUCTHUB</small>
      <h1>Create account</h1>
      <p>Register with your email and password.</p>

      {!firebaseReady && (
        <p className="error">
          Firebase is not configured yet. Add your configuration from .env.example
          to .env.local and restart the server.
        </p>
      )}

      {(localError || error) && <p className="error">{localError || error}</p>}

      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => {
              clearError();
              setLocalError("");
              setEmail(e.target.value);
            }}
            placeholder="name@example.com"
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => {
              clearError();
              setLocalError("");
              setPassword(e.target.value);
            }}
            minLength="6"
            required
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />
        </label>
        <label>
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => {
              clearError();
              setLocalError("");
              setConfirm(e.target.value);
            }}
            required
            placeholder="Repeat password"
            autoComplete="new-password"
          />
        </label>
        <button
          type="submit"
          className="btn"
          disabled={busy || !firebaseReady}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <button
        type="button"
        className="btn light full"
        onClick={google}
        disabled={busy || !firebaseReady}
      >
        Continue with Google
      </button>

      <p className="auth-switch">
        Already registered? <Link to="/login">Sign in</Link>
      </p>
    </section>
  );
}
