import { enTranslations } from './en';
import { esTranslations } from './es';
import { frTranslations } from './fr';
import { itTranslations } from './it';
import { ptTranslations } from './pt';

export type TranslationKeys = {
  subject: string;
  greeting: string;
  newContactMessage: string;
  contactDetails: string;
  businessDetails: string;
  footerText: string;
  copyright: string;
};

export const translations = {
  en: enTranslations,
  es: esTranslations,
  fr: frTranslations,
  it: itTranslations,
  pt: ptTranslations,
};

export type SupportedLocale = keyof typeof translations;

export {
  enTranslations,
  esTranslations,
  frTranslations,
  itTranslations,
  ptTranslations,
};
