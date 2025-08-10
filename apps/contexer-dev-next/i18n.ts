import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { Language } from './src/utils/lang';

// Supported language list
const locales = Object.values(Language);

export default getRequestConfig(async ({ locale: _locale, requestLocale }) => {
  // Get requested language
  const locale = await requestLocale;
  
  // Verify if the requested language is supported
  if (!locales.includes(locale as Language)) {
    notFound();
  }

  // Load corresponding message file based on current language
  const messages = (await import(`./src/messages/${locale}.json`)).default;

  return {
    locale,
    messages,
    // Redirect to default language when accessing unsupported language
    onError: (error) => {
      if (error.code === 'MISSING_MESSAGE') {
        console.warn('Missing message:', error.message);
        return null;
      }
      throw error;
    }
  };
}); 