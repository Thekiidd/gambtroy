import { isLocale, type Locale } from '../../../lib/i18n';

const content = {
  es: {
    title: 'Legal y privacidad',
    terms: 'Este MVP es una demo técnica. No reemplaza atención psicológica o médica profesional.',
    privacy: 'Los datos sensibles deben gestionarse bajo consentimiento explícito y cifrado en producción.',
    health: 'Si existe riesgo inmediato, contacta servicios de emergencia locales.'
  },
  en: {
    title: 'Legal and privacy',
    terms: 'This MVP is a technical demo. It does not replace professional psychological or medical care.',
    privacy: 'Sensitive data must be handled with explicit consent and encryption in production.',
    health: 'If there is immediate risk, contact local emergency services.'
  }
};

export default function LegalPage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'es';
  const t = content[locale];

  return (
    <main className="container">
      <h1>{t.title}</h1>
      <ul>
        <li>{t.terms}</li>
        <li>{t.privacy}</li>
        <li>{t.health}</li>
      </ul>
    </main>
  );
}
