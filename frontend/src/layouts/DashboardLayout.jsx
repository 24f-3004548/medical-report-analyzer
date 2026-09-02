import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: "grid" },
  { to: "/reports", label: "Reports", icon: "file" },
  { to: "/profile", label: "Profile", icon: "person" },
];

function navLinkClass({ isActive }) {
  return `group flex items-center gap-3 rounded-btn px-3 py-2.5 text-body-sm font-medium ${
    isActive
      ? "bg-forest-light text-forest"
      : "text-muted hover:bg-page hover:text-ink"
  }`;
}

function NavIcon({ name }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    file: (
      <>
        <path d="M6 3.5h8l4 4V20.5H6z" />
        <path d="M14 3.5v4h4M9 12h6M9 16h6" />
      </>
    ),
    person: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M4.5 20c.8-3.2 3.3-5 7.5-5s6.7 1.8 7.5 5" />
      </>
    ),
  };

  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-page">

      {/* =========================================================
          SIDEBAR
      ========================================================= */}
      <aside className="fixed left-0 top-0 z-50 hidden h-screen w-[230px] flex-col overflow-hidden border-r border-border bg-white md:flex">

        {/* Logo */}
        <div className="px-4 py-5">
          <NavLink to="/dashboard" aria-label="Veris dashboard">
            <Logo size="sm" />
          </NavLink>
        </div>

        {/* Navigation */}
        <nav className="mt-6 space-y-1 px-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navLinkClass}
            >
              <NavIcon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto border-t border-border px-4 pb-5 pt-4">

          <NavLink
            to="/reports/upload"
            className="mb-3 block"
          >
            <Button size="sm" className="w-full">
              Upload report
            </Button>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-btn px-3 py-2.5 text-body-sm font-medium text-muted hover:bg-critical-bg hover:text-critical"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" />
            </svg>

            Log out
          </button>

        </div>

      </aside>


      {/* =========================================================
          MAIN AREA
      ========================================================= */}
      <div className="min-w-0 md:ml-[230px]">

        {/* Header */}
        <header className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-8">

          {/* Mobile logo */}
          <div className="md:hidden">
            <NavLink to="/dashboard">
              <Logo size="sm" />
            </NavLink>
          </div>

          {/* Breadcrumb */}
          <div className="hidden text-body-sm text-muted md:block">
            Workspace /{" "}
            <span className="text-ink">
              Health overview
            </span>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-3">

            {/* Notification */}
            <svg
              className="h-4 w-4 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              aria-hidden="true"
            >
              <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>


            {/* Account menu */}
            <div
              className="relative"
              ref={menuRef}
            >
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-white text-body-sm"
                aria-label="Account menu"
              >
                {(user?.fullName || "V")
                  .charAt(0)
                  .toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-card border border-border bg-white py-1 shadow-lg">

                  <NavLink
                    to="/profile"
                    className="block px-4 py-2 text-body-sm text-ink hover:bg-page"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </NavLink>

                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-body-sm text-critical hover:bg-critical-bg"
                  >
                    Log out
                  </button>

                </div>
              )}
            </div>


            {/* Mobile menu button */}
            <button
              className="flex h-8 w-8 items-center justify-center text-ink md:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                {mobileOpen ? (
                  <path d="m6 6 12 12M18 6 6 18" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>

          </div>

        </header>


        {/* Mobile navigation */}
        {mobileOpen && (
          <nav className="border-b border-border bg-white px-4 py-3 md:hidden">

            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </NavLink>
            ))}

            <NavLink
              to="/reports/upload"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block"
            >
              <Button size="sm" className="w-full">
                Upload report
              </Button>
            </NavLink>

          </nav>
        )}


        {/* Page content */}
        <main className="mx-auto max-w-[1180px] px-4 py-7 sm:px-6 lg:px-10 lg:py-9">
          <Outlet />
        </main>

      </div>

    </div>
  );
}