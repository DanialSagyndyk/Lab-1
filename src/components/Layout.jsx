import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState } from "react";
import PWAStatus from "./PWAStatus.jsx";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  const navLinks = [
    ["/", "Home"],
    ["/products", "Products"],
    ["/about", "About"],
    ["/dashboard", "Dashboard"],
  ];

  return (
    <>
      <header>
        <Link className="logo" to="/">
          Product<span>Hub</span>
        </Link>
        <button className="menu-toggle" type="button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(v => !v)}>{menuOpen ? "Close" : "Menu"}</button>
        <nav className={menuOpen ? "nav-open" : ""} onClick={() => setMenuOpen(false)}>
          {navLinks.map(([to, title]) => (
            <NavLink end={to === "/"} key={to} to={to}>
              {title}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button
                type="button"
                className="nav-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Signup</NavLink>
            </>
          )}
        </nav>
      </header>
      <PWAStatus />
      <main>
        <Outlet />
      </main>
      <footer>
        © 2026 ProductHub · PWA, Offline Data & Firebase Authentication
      </footer>
    </>
  );
}
