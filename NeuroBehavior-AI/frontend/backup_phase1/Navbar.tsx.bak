import { NavLink, Link, useNavigate } from "react-router-dom";
import { clearAuthSession, getAuthUser, isLoggedIn } from "../utils/auth";

const protectedLinks = [
  { label: "Typing Test", path: "/typing-test" },
  { label: "Attention Test", path: "/attention-test" },
  { label: "Reading Test", path: "/reading-test" },
  { label: "Final Result", path: "/final-result" },
  { label: "History", path: "/history" },
];

const baseNavClass =
  "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200";
const activeNavClass = "bg-blue-600 text-white shadow-md";
const inactiveNavClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";

const Navbar = () => {
  const navigate = useNavigate();
  const user = getAuthUser();
  const loggedIn = isLoggedIn();

  function handleLogout() {
    clearAuthSession();
    navigate("/login");
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold shadow">
            N
          </div>
          <div>
            <p className="text-xl font-extrabold text-blue-700 leading-none">
              NeuroBehavior AI
            </p>
            <p className="text-[11px] text-slate-500 leading-none mt-1">
              Behavioral Screening Platform
            </p>
          </div>
        </Link>

        <div className="hidden md:flex flex-wrap items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseNavClass} ${isActive ? activeNavClass : inactiveNavClass}`
            }
          >
            Home
          </NavLink>

          {loggedIn &&
            protectedLinks.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `${baseNavClass} ${isActive ? activeNavClass : inactiveNavClass}`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </div>

        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {(user?.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="max-w-[140px] truncate text-sm font-medium text-slate-700">
                  {user?.full_name || "User"}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition-all duration-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-all duration-200"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow hover:scale-[1.02] transition-all duration-200"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
