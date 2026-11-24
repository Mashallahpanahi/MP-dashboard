import AppRoutes from "@routes/index";
import { useLanguageStore } from "@store/languageStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./styles/globals.css";

function App() {
  const { i18n } = useTranslation();
  const { language } = useLanguageStore();


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
