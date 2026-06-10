/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { selectAuth, selectTheme } from "@/store/selectors";
import { toggleDarkMode, setDarkMode } from "@/store/slices/themeSlice";
import { useUpdateSettingsMutation } from "@/store/api/userApi";
import { getCookieValue } from "@/utils/cookies";

const DarkModeButton = () => {
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector(selectTheme);
  const { user } = useAppSelector(selectAuth);

  const [updateSettings, { isLoading }] = useUpdateSettingsMutation();

  const handleToggleDarkMode = async () => {
    dispatch(toggleDarkMode());

    if (isLoading) return;
    try {
      if (user) {
        await updateSettings({ id: user.id as string, darkMode: !isDarkMode });
      }
    } catch (error) {
      console.error("Error toggling dark mode:", error);
    }
  };

  useEffect(() => {
    const isUserPreferredMode = user?.settings?.darkMode;

    if (isUserPreferredMode !== undefined) {
      dispatch(setDarkMode(isUserPreferredMode as boolean));
    } else {
      dispatch(setDarkMode(getCookieValue("is_dark_mode") === "true"));
    }
  }, [user, dispatch]);

  return (
    <button
      onClick={handleToggleDarkMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
};

export default DarkModeButton;
