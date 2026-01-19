import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../locales/en.json";
import zh from "../locales/zh.json";

const LANGUAGE_KEY = "@pocket_squeak_language";

const resources = {
  en: { translation: en },
  zh: { translation: zh },
};

export const supportedLanguages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
];

// Get device language, fallback to 'en'
const getDeviceLanguage = (): string => {
  const deviceLocale = Localization.getLocales()[0]?.languageCode ?? "en";
  // Map zh-Hans, zh-Hant, etc. to zh
  if (deviceLocale.startsWith("zh")) return "zh";
  // Only use if we support this language
  return deviceLocale in resources ? deviceLocale : "en";
};

// Initialize i18n
export const initI18n = async () => {
  // Try to load saved language preference
  let savedLanguage: string | null = null;
  try {
    savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
  } catch (error) {
    console.warn("Failed to load language preference:", error);
  }

  const initialLanguage = savedLanguage || getDeviceLanguage();

  await i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

  return i18n;
};

// Change language and persist
export const changeLanguage = async (languageCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    await i18n.changeLanguage(languageCode);
  } catch (error) {
    console.error("Failed to change language:", error);
    throw error;
  }
};

// Get current language
export const getCurrentLanguage = (): string => {
  return i18n.language || "en";
};

export default i18n;
