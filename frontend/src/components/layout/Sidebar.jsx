import { NavLink, useNavigate } from "react-router-dom";
import {
  BookOpen,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  GitCompare,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Menu,
  Search,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useSidebar } from "../../context/SidebarContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "My Papers", path: "/papers", icon: FileText },
  { name: "AI Assistant", path: "/assistant", icon: Bot },
  { name: "Compare", path: "/compare", icon: GitCompare },
  { name: "Research Gaps", path: "/research-gaps", icon: Lightbulb },
  { name: "Search", path: "/search", icon: Search },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const email = user?.email || "No email";
  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    email.split("@")[0] ||
    "Researcher";
  const initial = name.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-900 lg:static lg:z-auto lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${collapsed ? "lg:w-20" : "lg:w-64"}`}
      >
        <div className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-800 ${collapsed ? "justify-center px-3" : "justify-between px-5"}`}>
          <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <BookOpen size={20} />
            </div>
            {!collapsed && <span className="truncate font-bold text-slate-900 dark:text-slate-100">ResearchFlow AI</span>}
          </NavLink>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg py-3 text-sm font-medium transition ${collapsed ? "justify-center px-3" : "gap-3 px-3"} ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={19} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <NavLink
            to="/profile"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? name : undefined}
            className={`mb-2 flex items-center rounded-lg bg-slate-50 p-2.5 transition hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-500/15 ${collapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{initial}</div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
              </div>
            )}
          </NavLink>
          <button
            type="button"
            onClick={handleSignOut}
            title={collapsed ? "Sign out" : undefined}
            className={`flex w-full items-center rounded-lg py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300 ${collapsed ? "justify-center px-3" : "gap-3 px-3"}`}
          >
            <LogOut size={18} />
            {!collapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
      >
        <Menu size={19} />
      </button>
    </>
  );
}

export default Sidebar;
