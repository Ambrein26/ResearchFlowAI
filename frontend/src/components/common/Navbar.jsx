import { Link } from "react-router-dom";
import { FileSearch } from "lucide-react";

function Navbar() {
  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <FileSearch size={20} />
          </div>

          <span className="text-lg font-bold text-slate-900">
            ResearchFlow AI
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-3">

          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Get Started
          </Link>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;