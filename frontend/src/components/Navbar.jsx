
import { NavLink, useNavigate } from "react-router-dom";
import { BookOpen, LayoutDashboard, BookMarked, ListTodo, CalendarDays, Timer,History,CalendarRange ,LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";


export default function Navbar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Subjects", path: "/subjects", icon: BookMarked },
    { name: "Tasks", path: "/tasks", icon: ListTodo },
    { name: "Study Plan", path: "/study-plan", icon: CalendarDays },
    { name: "Study Timer", path: "/study-timer", icon: Timer },
    {
  name: "Study History",
  path: "/study-history",
  icon: History,
},
{
  name: "Calendar",
  path: "/calendar",
  icon: CalendarRange,
},
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-violet-100 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="rounded-xl bg-violet-100 p-2 text-violet-700">
            <BookOpen size={22} />
          </span>
          <span className="text-lg font-bold text-gray-800">
            Study<span className="text-violet-600">Planner</span>
          </span>
        </NavLink>

        <div className="flex flex-wrap items-center gap-1">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-violet-100 text-violet-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={17} />
              <span>{name}</span>
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
