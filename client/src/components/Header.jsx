import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={`site-header ${isHome ? "site-header--floating" : ""}`}>
      <div className="header-pill">
        <Link to="/" className="header-brand">
          <span className="header-logo-wrap">
            <img src="/assets/mainLogo.gif" alt="" className="header-logo" />
          </span>
          <span className="header-brand-text">
            Gem <span className="header-brand-accent">AI</span>
          </span>
        </Link>

        <nav className="header-nav">
          <a href="/#features" className="header-link">
            Features
          </a>
          <a href="/#gallery" className="header-link">
            Gallery
          </a>
          <Link to="/create" className="header-link header-link--accent">
            Create
          </Link>
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <Link to="/profile" className="header-profile">
                <span className="avatar-small">{user.name.charAt(0).toUpperCase()}</span>
                <span className="user-name">{user.name}</span>
              </Link>
              <button type="button" onClick={handleLogout} className="header-ghost-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-ghost-btn">
                Log In
              </Link>
              <Link to="/signup" className="header-cta-btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
