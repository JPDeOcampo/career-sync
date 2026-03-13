"use client";
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
import { Plus, User, LogOut } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import DarkModeButton from "./shared/DarkModeButton";
import { useSingleLogoutMutation } from "@/store/api/authApi";

interface NavbarProps {
  onAddJob: () => void;
}

const Navbar = ({ onAddJob }: NavbarProps) => {
  const router = useRouter();
  const auth = useAppSelector((state) => state.auth);
  const user = auth.user;

  const [singleLogout] = useSingleLogoutMutation();

  const handleLogout = async () => {
    try {
      await singleLogout().unwrap();
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  // const getAvatarColor = (name?: string) => {
  //   const colors = [
  //     "bg-red-400",
  //     "bg-pink-400",
  //     "bg-purple-400",
  //     "bg-indigo-400",
  //     "bg-blue-400",
  //     "bg-cyan-400",
  //     "bg-teal-400",
  //     "bg-emerald-400",
  //     "bg-orange-400",
  //     "bg-amber-400",
  //   ];

  //   if (!name) return "bg-gray-400";

  //   let hash = 0;
  //   for (let i = 0; i < name.length; i++) {
  //     hash = name.charCodeAt(i) + ((hash << 5) - hash);
  //   }
  //   const index = Math.abs(hash) % colors.length;
  //   return colors[index];
  // };

  return (
    <div className="sticky top-0 z-30 surface border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12 mb-0" />
            <div>
              <h1 className="text-xl font-bold text-default">CareerSync</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your job applications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onAddJob}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Job</span>
            </button>

            {/* Handle dark mode */}
            <DarkModeButton />

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

export default Navbar;
