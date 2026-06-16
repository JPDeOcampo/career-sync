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
import { Skeleton, LoadingSpinner } from "@/components/shared/Loading";
import { selectAuth } from "@/store/selectors";
import { cn } from "@/utils/cn";
import Image from "next/image";
import { useAppDispatch } from "@/hooks/useRedux";
import { logout } from "@/store/slices/authSlice";

const ProfileAvatar = ({
  profile,
  className,
  isLoading = false,
}: {
  profile: { profileType: string; profileValue: string } | undefined;
  className?: string;
  isLoading?: boolean;
}) => {
  const isColorProfile = profile?.profileType === "COLOR";

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm overflow-hidden",
        isLoading && "bg-background",
        !isColorProfile && !profile && !isLoading && "bg-red-400",
        className,
      )}
      style={
        isColorProfile ? { backgroundColor: profile?.profileValue } : undefined
      }
    >
      {isLoading && <LoadingSpinner />}

      {!isLoading &&
        profile &&
        (isColorProfile ? (
          <User className="w-4 h-4" />
        ) : (
          <Image
            src={profile?.profileValue || ""}
            alt="Profile"
            className="w-full h-full object-cover"
            width={28}
            height={28}
          />
        ))}

      {!isLoading && !profile && <User className="w-4 h-4" />}
    </div>
  );
};

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user, isAuthLoading } = useAppSelector(selectAuth);

  const [singleLogout, { isLoading: isLoadingLogout }] = useLogoutMutation();

  const { handleAddJob } = useJobHooks();

  const handleLogout = async () => {
    try {
      await singleLogout();
      router.push("/login");
      setTimeout(() => {
        dispatch(logout());
      }, 500);
    } catch (err) {
      console.error(err);
    }
  };

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
                <DropdownMenuTrigger aria-label="Profile">
                  <div
                    className="flex items-center gap-2 p-1 rounded-full 
                            hover:bg-gray-200 dark:hover:bg-gray-600
                            transition-colors"
                  >
                    <ProfileAvatar
                      profile={user?.profile}
                      isLoading={isAuthLoading}
                    />
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
                  >
                    {isLoadingLogout && <LoadingSpinner className="w-4 h-4" />}
                    {!isLoadingLogout && <LogOut className="w-4 h-4 mr-2" />}
                    Logout{" "}
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
