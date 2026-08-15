import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  GitCompare,
  Settings,
  BookOpen,
  LogOut,
  User,
  Bot,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";


function Sidebar() {

  const navigate = useNavigate();

  const { user, signOut } = useAuth();


  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      name: "My Papers",
      path: "/papers",
      icon: FileText,
    },

    {
      name: "AI Assistant",
      path: "/assistant",
      icon: Bot,
    },

    {
      name: "Compare",
      path: "/compare",
      icon: GitCompare,
    },

    {
    name: "Search",
    path: "/search",
    icon: FileText,
    },

    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];


  // ============================================================
  // User Information
  // ============================================================

  const email =
    user?.email || "No email";


  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split("@")[0] ||
    "Researcher";


  const initial =
    name.charAt(0).toUpperCase();


  // ============================================================
  // Sign Out
  // ============================================================

  const handleSignOut = async () => {

    try {

      await signOut();

      navigate("/login");

    } catch (error) {

      console.error(
        "Sign out failed:",
        error
      );

    }

  };


  return (

    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">

      {/* ======================================================
          Logo
      ====================================================== */}

      <div className="flex h-16 items-center border-b border-slate-200 px-6">

        <NavLink
          to="/dashboard"
          className="flex items-center gap-2"
        >

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">

            <BookOpen size={20} />

          </div>

          <span className="font-bold text-slate-900">
            ResearchFlow AI
          </span>

        </NavLink>

      </div>


      {/* ======================================================
          Navigation
      ====================================================== */}

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">

        {navItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >

              <Icon size={19} />

              {item.name}

            </NavLink>

          );

        })}

      </nav>


      {/* ======================================================
          User Section
      ====================================================== */}

      <div className="border-t border-slate-200 p-4">

        {/* Profile */}

        <NavLink
          to="/profile"
          className="mb-3 flex items-center gap-3 rounded-lg bg-slate-50 p-3 transition hover:bg-indigo-50"
        >

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">

            {initial}

          </div>


          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-900">

              {name}

            </p>

            <p className="truncate text-xs text-slate-500">

              {email}

            </p>

          </div>

        </NavLink>


        {/* Sign Out */}

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >

          <LogOut size={18} />

          Sign Out

        </button>

      </div>

    </aside>

  );

}


export default Sidebar;