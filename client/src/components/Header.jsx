import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Track scroll position — go transparent after 60px
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // On home: start opaque-white pill, become transparent on scroll
  // On other pages: always dark sticky bar
  const headerClass = [
    "site-header",
    isHome ? "site-header--home" : "site-header--inner",
    isHome && scrolled ? "site-header--scrolled" : "",
    menuOpen ? "site-header--open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="nav-inner">
        {/* Brand */}
        <Link to="/" className="header-brand" onClick={() => setMenuOpen(false)}>
          <span className="header-logo-wrap">
            <img src="/assets/mainLogo.gif" alt="Gem AI logo" className="header-logo" />
          </span>
          <span className="header-brand-text">
            Gem <span className="header-brand-accent">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="header-nav" aria-label="Main navigation">
          <a href="/#features" className="header-link">Features</a>
          <a href="/#gallery" className="header-link">Gallery</a>
          <Link to="/explore" className="header-link">Explore</Link>
          <Link to="/create" className="header-link header-link--accent">Create</Link>
        </nav>

        {/* Desktop actions */}
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
              <Link to="/login" className="header-ghost-btn">Log In</Link>
              <Link to="/signup" className="header-cta-btn">Sign Up</Link>
            </>
          )}
        </div>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="nav-hamburger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={`ham-bar ${menuOpen ? "ham-bar--open" : ""}`} />
          <span className={`ham-bar ${menuOpen ? "ham-bar--open" : ""}`} />
          <span className={`ham-bar ${menuOpen ? "ham-bar--open" : ""}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-label="Mobile navigation">
          <nav className="mobile-nav">
            <a href="/#features" className="mobile-link" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="/#gallery" className="mobile-link" onClick={() => setMenuOpen(false)}>Gallery</a>
            <Link to="/explore" className="mobile-link" onClick={() => setMenuOpen(false)}>Explore</Link>
            <Link to="/create" className="mobile-link mobile-link--accent" onClick={() => setMenuOpen(false)}>Create</Link>
          </nav>
          <div className="mobile-actions">
            {user ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  <span className="avatar-small">{user.name.charAt(0).toUpperCase()}</span>
                  {user.name}
                </Link>
                <button type="button" onClick={handleLogout} className="mobile-cta-btn mobile-cta-btn--ghost">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-cta-btn mobile-cta-btn--ghost" onClick={() => setMenuOpen(false)}>
                  Log In
                </Link>
                <Link to="/signup" className="mobile-cta-btn" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
