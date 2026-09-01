import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
  { to: "/profile", label: "Profile" },
];

function navLinkClass({ isActive }) {
  return `text-body font-medium transition-colors duration-150 ${
    isActive ? "text-forest" : "text-ink hover:text-forest"
  }`;
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-page">
      <header className="h-[60px] border-b border-border bg-white sticky top-0 z-40">
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-10">
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" aria-label="Veris dashboard">
              <Logo size="sm" />
            </NavLink>
            <nav className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={navLinkClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/reports/upload" className="hidden sm:block">
              <Button size="sm">Upload report</Button>
            </NavLink>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-light text-forest font-medium text-body-sm"
                aria-label="Account menu"
              >
                {(user?.name || "V").charAt(0).toUpperCase()}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-card border border-border bg-white py-1 shadow-lg">
                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-body text-ink hover:bg-forest-light"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-body text-critical hover:bg-critical-bg"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>

            <button
              className="md:hidden flex h-8 w-8 items-center justify-center text-ink"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                {mobileOpen ? (
                  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/reports/upload" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">
                Upload report
              </Button>
            </NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
