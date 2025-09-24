import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";

type Theme = "light" | "dark";
type Density = "comfortable" | "compact";
type Language = "bg" | "en";
type DateFormat = "relative" | "absolute";

// Translations for the live language demo
const translations = {
  bg: {
    title: "Визия и достъпност",
    description: "Персонализирайте как изглежда и се усеща приложението.",
    themeTitle: "Тема",
    themeDesc: "Изберете светъл или тъмен изглед.",
    light: "Светла",
    dark: "Тъмна",
    densityTitle: "Наситеност на изгледа",
    densityDesc: "Намалете отстоянията, за да виждате повече информация.",
    comfortable: "Комфортна",
    compact: "Компактна",
    languageTitle: "Език",
    languageDesc: "Изберете езика на интерфейса.",
    bulgarian: "Български",
    english: "English",
    langExample: "Примерен текстов етикет",
    dateFormatTitle: "Формат на дати",
    dateFormatDesc: "Изберете как да се показват датите в приложението.",
    relativeDate: "Относителен (преди 5 минути)",
    absoluteDate: "Абсолютен (24.09.2025 09:14)",
    saveButton: "Запази промените",
  },
  en: {
    title: "Appearance & Accessibility",
    description: "Customize how the app looks and feels.",
    themeTitle: "Theme",
    themeDesc: "Choose a light or dark look.",
    light: "Light",
    dark: "Dark",
    densityTitle: "Display Density",
    densityDesc: "Reduce spacing to see more information.",
    comfortable: "Comfortable",
    compact: "Compact",
    languageTitle: "Language",
    languageDesc: "Choose the interface language.",
    bulgarian: "Български",
    english: "English",
    langExample: "Sample Text Label",
    dateFormatTitle: "Date Format",
    dateFormatDesc: "Choose how dates are displayed in the app.",
    relativeDate: "Relative (5 minutes ago)",
    absoluteDate: "09/24/2025 09:14 AM",
    saveButton: "Save Changes",
  },
};

const AppearanceSettings: React.FC = () => {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState<Theme>("light");
  const [density, setDensity] = useState<Density>("comfortable");
  const [language, setLanguage] = useState<Language>(
    (i18n.language as Language) || "bg"
  );
  const [dateFormat, setDateFormat] = useState<DateFormat>("relative");

  // Style definitions for Comfortable vs. Compact density
  const densityStyles = {
    comfortable: {
      containerPadding: "p-4 sm:p-6",
      rowPadding: "py-4",
      description: "mt-1 text-sm",
      title: "text-md",
      buttonPadding: "px-4 py-2 text-sm",
      dateLabel: "text-sm",
      footerPadding: "pt-6 mt-6",
      mainTitle: "text-xl",
      mainDescription: "text-sm",
    },
    compact: {
      containerPadding: "p-3 sm:p-4",
      rowPadding: "py-2.5",
      description: "mt-0.5 text-xs",
      title: "text-sm",
      buttonPadding: "px-3 py-1.5 text-xs",
      dateLabel: "text-xs",
      footerPadding: "pt-4 mt-4",
      mainTitle: "text-lg",
      mainDescription: "text-xs",
    },
  };

  // Live translation function for the demo
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key] || key;
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleSave = () => {
    console.log("Saving Appearance Settings:", {
      theme,
      density,
      language,
      dateFormat,
    });
    alert("Настройките за визия са запазени (симулация).");
  };

  const SettingRow: React.FC<{
    title: string;
    description: string;
    children: React.ReactNode;
  }> = ({ title, description, children }) => (
    <div
      className={`sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start ${densityStyles[density].rowPadding}`}
    >
      <div className="sm:col-span-1">
        <h3
          className={`font-medium ${
            theme === "dark" ? "text-gray-200" : "text-gray-800"
          } ${densityStyles[density].title}`}
        >
          {title}
        </h3>
        <p
          className={`${densityStyles[density].description} ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`}
        >
          {description}
        </p>
      </div>
      <div className={`mt-2 sm:mt-0 sm:col-span-2`}>{children}</div>
    </div>
  );

  const themeClass =
    theme === "dark" ? "dark bg-gray-800 text-white" : "bg-white";
  const primaryBlue =
    theme === "dark"
      ? "bg-blue-700 border-blue-700"
      : "bg-blue-600 border-blue-600";
  const primaryBlueHover =
    theme === "dark" ? "hover:bg-blue-800" : "hover:bg-blue-700";
  const radioCheckboxBlue =
    theme === "dark"
      ? "text-blue-500 focus:ring-blue-600"
      : "text-blue-600 focus:ring-blue-500";

  return (
    <div
      className={`rounded-lg shadow-sm border transition-all duration-300 ${themeClass} ${
        densityStyles[density].containerPadding
      } ${density === "compact" ? "border-gray-300" : "border-gray-200"}`}
    >
      <h2 className={`font-semibold ${densityStyles[density].mainTitle}`}>
        {t("title")}
      </h2>
      <p
        className={`mt-1 ${
          theme === "dark" ? "text-gray-400" : "text-gray-600"
        } ${densityStyles[density].mainDescription}`}
      >
        {t("description")}
      </p>

      <div
        className={`mt-6 divide-y ${
          theme === "dark" ? "divide-gray-600" : "divide-gray-200"
        }`}
      >
        <SettingRow title={t("themeTitle")} description={t("themeDesc")}>
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-2 cursor-pointer rounded-md border ${
                densityStyles[density].buttonPadding
              } ${
                theme === "light"
                  ? `${primaryBlue} text-white`
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              <SunIcon className="h-4 w-4" />
              {t("light")}
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-2 cursor-pointer rounded-md border ${
                densityStyles[density].buttonPadding
              } ${
                theme === "dark"
                  ? `${primaryBlue} text-white`
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <MoonIcon className="h-4 w-4" />
              {t("dark")}
            </button>
          </div>
        </SettingRow>

        <SettingRow title={t("densityTitle")} description={t("densityDesc")}>
          <div className="flex gap-4">
            <button
              onClick={() => setDensity("comfortable")}
              className={`flex items-center gap-2 cursor-pointer rounded-md border ${
                densityStyles[density].buttonPadding
              } ${
                density === "comfortable"
                  ? `${primaryBlue} text-white`
                  : `${
                      theme === "dark" ? "bg-gray-700 text-white" : "bg-white"
                    } hover:bg-gray-500/20`
              }`}
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
              {t("comfortable")}
            </button>
            <button
              onClick={() => setDensity("compact")}
              className={`flex items-center gap-2 cursor-pointer rounded-md border ${
                densityStyles[density].buttonPadding
              } ${
                density === "compact"
                  ? `${primaryBlue} text-white`
                  : `${
                      theme === "dark" ? "bg-gray-700 text-white" : "bg-white"
                    } hover:bg-gray-500/20`
              }`}
            >
              <ArrowsPointingInIcon className="h-4 w-4" />
              {t("compact")}
            </button>
          </div>
        </SettingRow>

        <SettingRow title={t("languageTitle")} description={t("languageDesc")}>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as Language)}
            className={`cursor-pointer max-w-xs w-full rounded-md border shadow-sm focus:outline-none focus:border-indigo-500 ${
              densityStyles[density].buttonPadding
            } ${
              theme === "dark"
                ? "bg-gray-700 border-gray-500 text-white"
                : "bg-white border-gray-300"
            }`}
          >
            <option value="bg">{t("bulgarian")}</option>
            <option value="en">{t("english")}</option>
          </select>
          <p
            className={`text-xs mt-2 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Пример: {t("langExample")}
          </p>
        </SettingRow>

        <SettingRow
          title={t("dateFormatTitle")}
          description={t("dateFormatDesc")}
        >
          <div
            className={`mt-2 ${
              density === "compact" ? "space-y-2" : "space-y-3"
            }`}
          >
            <label
              className={`cursor-pointer flex items-center gap-2 ${densityStyles[density].dateLabel}`}
            >
              <input
                type="radio"
                name="date"
                checked={dateFormat === "relative"}
                onChange={() => setDateFormat("relative")}
                className={`cursor-pointer h-4 w-4 rounded border-gray-300 ${radioCheckboxBlue}`}
              />{" "}
              {t("relativeDate")}
            </label>
            <label
              className={`cursor-pointer flex items-center gap-2 ${densityStyles[density].dateLabel}`}
            >
              <input
                type="radio"
                name="date"
                checked={dateFormat === "absolute"}
                onChange={() => setDateFormat("absolute")}
                className={`cursor-pointer h-4 w-4 rounded border-gray-300 ${radioCheckboxBlue}`}
              />{" "}
              {t("absoluteDate")}
            </label>
          </div>
        </SettingRow>
      </div>

      <div
        className={`border-t ${
          theme === "dark" ? "border-gray-600" : "border-gray-200"
        } text-right ${densityStyles[density].footerPadding}`}
      >
        <button
          onClick={handleSave}
          className={`cursor-pointer ${primaryBlue} text-white rounded-md font-semibold ${primaryBlueHover} ${densityStyles[density].buttonPadding}`}
        >
          {t("saveButton")}
        </button>
      </div>
    </div>
  );
};

export default AppearanceSettings;
