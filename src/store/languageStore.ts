import { create } from 'zustand';  //Its job is to create a global state store.
import { persist } from 'zustand/middleware';

type Language = 'en' | 'fa';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'app-language',
    }
  )
);