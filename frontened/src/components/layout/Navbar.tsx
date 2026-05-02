import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
    setDark(!dark);
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    return parts[0][0] + (parts[1]?.[0] || "");
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-900 border-b flex items-center justify-between px-6 relative">
      <h1 className="font-semibold text-lg text-gray-800 dark:text-white">
        TaskFlow
      </h1>


      <div className="relative">

        <div
          onClick={() => setOpen(!open)}
          className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer font-semibold"
        >
          {getInitials()}
        </div>

        {open && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 z-50">

            <p className="font-medium text-gray-800 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {user?.email}
            </p>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                🌙 Dark Mode
              </span>

              <button
                onClick={toggleTheme}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  dark ? "bg-blue-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    dark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 rounded hover:bg-red-100 text-red-500 text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}