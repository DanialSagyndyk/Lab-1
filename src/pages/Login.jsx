import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const {
    user,
    login,
    googleLogin,
    error,
    clearError,
    loading,
    firebaseReady,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname || "/profile";

  if (loading) return <p className="loading">Checking session…</p>;
  if (user) return <Navigate to="/profile" replace />;

  async function submit(e) {
    e.preventDefault();
    clearError();
    setBusy(true);
    try {
      await login(email, password);
      navigate(destination, { replace: true });
    } catch {
      // error is handled and displayed via AuthContext
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    clearError();
    setBusy(true);
    try {
      await googleLogin();
      navigate(destination, { replace: true });
    } catch {
      // error is handled and displayed via AuthContext
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login">
      <small>MEMBER ACCESS</small>
      <h1>Welcome back</h1>
      <p>Sign in to your ProductHub account.</p>

      {!firebaseReady && (
        <p className="error">
          Firebase is not configured yet. Add your configuration from .env.example
          to .env.local and restart the server.
        </p>
      )}

      {error && <p className="error">{error}</p>}

      <form onSubmit={submit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => {
              clearError();
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
              setPassword(e.target.value);
            }}
            placeholder="Password"
            required
            minLength="6"
            autoComplete="current-password"
          />
        </label>
        <button
          type="submit"
          className="btn"
          disabled={busy || !firebaseReady}
        >
          {busy ? "Please wait…" : "Sign in"}
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
        Don't have an account? <Link to="/signup">Create one</Link>
      </p>
    </section>
  );
}
