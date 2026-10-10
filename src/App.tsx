import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "@store/languageStore";
import { useAuthStore } from "@store/authStore"; // 👈 import auth store
import AppRoutes from "@routes/index";
import "./styles/globals.css";

function App() {
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();

  // --- Get the checkAuth function from the store ---
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // // --- Run auth check once when app loads ---
  // useEffect(() => {
  //   checkAuth(); // verifies expiry and logs out if 35 days have passed
  // }, [checkAuth]);

  // --- Language sync (RTL/LTR) ---
  useEffect(() => {
    const currentLang = i18n.language;
    if (currentLang !== language) {
      i18n.changeLanguage(language);
    }
    const dir = language === "fa" ? "rtl" : "ltr";
    if (document.documentElement.dir !== dir) {
      document.documentElement.dir = dir;
    }
  }, [language, i18n]);

  return <AppRoutes />;
}

export default App;
