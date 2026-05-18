"use client";
import { useState } from "react";
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
import { Plus, User, LogOut, Settings } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import DarkModeButton from "./shared/DarkModeButton";
import { useLogoutMutation } from "@/store/api/authApi";
import useJobHooks from "@/hooks/useJob";
import SettingsModal from "./SettingsModal";
import { Skeleton } from "@/components/shared/Loading";
import { selectAuth } from "@/store/selectors";

const Navbar = () => {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, isAuthLoading } = useAppSelector(selectAuth);

  const [singleLogout] = useLogoutMutation();

  const { handleAddJob } = useJobHooks();

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
    <>
      <div className="sticky top-0 z-30 surface border-b border-gray-200 dark:border-gray-700 shadow-sm px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Logo
                className="h-10 w-10 sm:h-11 sm:w-11 shrink-0"
                iconClassName="w-6 h-6 sm:w-7 sm:h-7"
              />

              <div className="truncate">
                <h1 className="text-base sm:text-xl font-bold text-default truncate">
                  CareerSync
                </h1>
                <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 truncate">
                  Manage your job applications
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Add Job Button */}
              <button
                onClick={handleAddJob}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden md:inline">Add Job</span>
              </button>

              {/* Dark Mode */}
              <DarkModeButton />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div
                    className="flex items-center gap-2 p-1 rounded-full 
                            hover:bg-gray-200 dark:hover:bg-gray-600
                            transition-colors"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-400 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      {isAuthLoading && (
                        <>
                          <Skeleton className="w-35 h-4 rounded-md" />
                          <Skeleton className="w-40 h-4 rounded-md" />
                        </>
                      )}

                      {!isAuthLoading && (
                        <>
                          <p className="text-sm font-medium truncate">
                            {user?.firstName || "-"} {user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {user?.email || "-"}
                          </p>
                        </>
                      )}
                    </div>
                  </DropdownMenuLabel>

                  {/* Separator */}
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setIsSettingsOpen(true)}
                    className="cursor-pointer"
                    disabled={isAuthLoading}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>

                  {/* Separator
                  <DropdownMenuSeparator /> */}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                    disabled={isAuthLoading}
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
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
};

export default Navbar;
