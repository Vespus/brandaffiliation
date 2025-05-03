import { cache } from 'react';
import { db } from '@/db';
import { translations } from '@/db/schema';
import { eq } from 'drizzle-orm';

type Messages = Record<string, Record<string, string> | string>;

function transformTranslations(translationsList: { entityType: string; entityId: string; textValue: string }[]): Messages {
  const result: Messages = {};

  for (const translation of translationsList) {
    const { entityType, entityId, textValue } = translation;
    
    if (!result[entityType]) {
      result[entityType] = {};
    }
    
    if (typeof result[entityType] === 'object') {
      (result[entityType] as Record<string, string>)[entityId] = textValue;
    }
  }

  return result;
}

// Cached function to get translations for a specific locale
export const getTranslations = cache(async (locale: string): Promise<Messages> => {
  try {
    // Fetch translations from the database for the specified locale
    const translationsList = await db.query.translations.findMany({
      where: eq(translations.langCode, locale),
      columns: {
        entityType: true,
        entityId: true,
        textValue: true
      }
    });

    return transformTranslations(translationsList);
  } catch (error) {
    console.error(`Failed to load translations for locale: ${locale}`, error);
    return {};
  }
});

// Default translations to use as fallback
export const defaultTranslations: Messages = {
  app: {
    title: "Brand Affiliation",
    description: "Manage your brand affiliations"
  },
  common: {
    welcome: "Welcome",
    loading: "Loading...",
    error: "An error occurred",
    success: "Success"
  },
  auth: {
    signIn: "Sign In",
    signUp: "Sign Up",
    signOut: "Sign Out",
    email: "Email",
    password: "Password"
  }
};