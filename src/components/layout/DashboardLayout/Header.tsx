import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguageStore } from "@store/languageStore";

const Header = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as "en" | "fa";
    setLanguage(newLang);
  };

  return (
    <header className="flex items-center justify-end p-2 bg-white shadow">
      {/* Language Select - always on the right */}
      <div className="relative">
        <select
          value={language}
          onChange={handleLanguageChange}
          className="px-4 py-2 pr-10 bg-gray-100 border-2 border-blue-200/30 rounded-md 
                     focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-blue-500/50
                     hover:border-blue-400/50 transition duration-200 appearance-none
                     text-gray-700"
          style={{ direction: language === "fa" ? "rtl" : "ltr" }}
        >
          <option value="en">English</option>
          <option value="fa">فارسی</option>
        </select>
        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg
            className="fill-current h-4 w-4"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
