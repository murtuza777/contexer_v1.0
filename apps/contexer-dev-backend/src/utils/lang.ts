export enum Language {
  English = "en",
  Chinese = "zh-CN",
}

export const LanguageNativeNames: { name: string; locale: Language }[] = [
  {
    name: "English",
    locale: Language.English,
  },
];

export const locales = LanguageNativeNames.map((item) => item.locale);
