export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export function isLocale(input: string): input is Locale {
  return locales.includes(input as Locale);
}

const dictionaries = {
  es: {
    title: 'GambTroy',
    subtitle: 'Rompe la adicción al juego con estructura, datos y apoyo real.',
    cta: 'Comenzar demo MVP',
    sections: [
      {
        title: 'Autenticación segura',
        description: 'Registro/login con JWT y base para email verification.'
      },
      {
        title: 'Bloqueo de sitios',
        description: 'CRUD de blocklist para reducir exposición a apuestas.'
      },
      {
        title: 'Pérdidas y guardianes',
        description: 'Registro económico y flujo inicial de invitaciones guardian.'
      }
    ],
    legal: 'Términos, privacidad y aviso de salud mental',
    switchLabel: 'Idioma'
  },
  en: {
    title: 'GambTroy',
    subtitle: 'Break gambling addiction with structure, data, and real support.',
    cta: 'Start MVP demo',
    sections: [
      {
        title: 'Secure authentication',
        description: 'Register/login with JWT and a base for email verification.'
      },
      {
        title: 'Site blocking',
        description: 'Blocklist CRUD to reduce exposure to betting platforms.'
      },
      {
        title: 'Losses and guardians',
        description: 'Financial tracking and initial guardian invitation flow.'
      }
    ],
    legal: 'Terms, privacy, and mental health notice',
    switchLabel: 'Language'
  }
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
