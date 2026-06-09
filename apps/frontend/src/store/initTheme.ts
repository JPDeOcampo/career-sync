import type { Store } from "@reduxjs/toolkit";
import { setDarkMode } from "./slices/themeSlice";

export const initTheme = (store: Store) => {
  const user = store.getState().auth.user;

  const userPref = user?.settings?.darkMode;

  const isDark =
    userPref !== undefined
      ? userPref
      : window.matchMedia("(prefers-color-scheme: dark)").matches;

  store.dispatch(setDarkMode(isDark));
  document.body.classList.toggle("dark", isDark);
};
