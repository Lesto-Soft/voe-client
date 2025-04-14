import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  // Load translations using http backend
  .use(HttpBackend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: "bg", // Fallback language if detection fails or translation is missing
    debug: process.env.NODE_ENV === "development", // Enable debug output in development
    ns: ["translation"], // Namespace for your translations
    defaultNS: "translation",
    backend: {
      // Path where resources get loaded from
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      // Order and from where user language should be detected
      order: [
        "querystring",
        "cookie",
        "localStorage",
        "sessionStorage",
        "navigator",
        "htmlTag",
      ],
      // Keys or params to lookup language from
      lookupQuerystring: "lng",
      lookupCookie: "i18next",
      lookupLocalStorage: "i18nextLng",
      lookupSessionStorage: "i18nextLng",
      // Cache user language on
      caches: ["localStorage", "cookie"],
      excludeCacheFor: ["cimode"], // Languages to not persist (e.g., 'cimode' for debugging)
    },
  });

export default i18n;
