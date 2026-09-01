import { Link } from "react-router-dom";
import Logo from "./Logo";
import Button from "./Button";

export default function Navbar() {
  return (
    <header className="h-[60px] border-b border-border bg-white">
      <div className="mx-auto flex h-full max-w-content items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link to="/" aria-label="Veris home">
          <Logo size="sm" />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/login"
            className="inline text-body-sm sm:text-body font-medium text-ink hover:text-forest transition-colors duration-150"
          >
            Sign in
          </Link>
          <Link to="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
