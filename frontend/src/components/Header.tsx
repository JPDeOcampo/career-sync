"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "./shared/Logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./shared/DropdownMenu";
import { Moon, Sun, Plus, User, LogOut } from "lucide-react";
import { STORAGE_KEYS, storage } from "@/utils/storage";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";

const Header = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const user = auth.user;

  const [darkMode, setDarkMode] = useState(() => {
    const saved = storage.get<boolean>(STORAGE_KEYS.THEME);
    return saved ?? false;
  });

  const getAvatarColor = (name?: string) => {
    const colors = [
      "bg-red-400",
      "bg-pink-400",
      "bg-purple-400",
      "bg-indigo-400",
      "bg-blue-400",
      "bg-cyan-400",
      "bg-teal-400",
      "bg-emerald-400",
      "bg-orange-400",
      "bg-amber-400",
    ];

    if (!name) return "bg-gray-400";

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    storage.set(STORAGE_KEYS.THEME, darkMode);
  }, [darkMode]);

  return (
    <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12 mb-0" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Job Tracker
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your job applications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div
                    className={`w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white font-semibold shadow-sm`}
                  >
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
