import Link from 'next/link';
import { getDictionary, isLocale, locales, type Locale } from '../../lib/i18n';

export default function LocalizedHomePage({ params }: { params: { locale: string } }) {
  const locale: Locale = isLocale(params.locale) ? params.locale : 'es';
  const t = getDictionary(locale);

  return (
    <main className="container">
      <header className="topbar">
        <strong>{t.title}</strong>
        <nav>
          <span>{t.switchLabel}: </span>
          {locales.map((item) => (
            <Link key={item} href={`/${item}`} className={item === locale ? 'active' : ''}>
              {item.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <h1>{t.title}</h1>
      <p>{t.subtitle}</p>
      <button className="primary">{t.cta}</button>

      <section className="grid">
        {t.sections.map((card) => (
          <article className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>

      <p className="legal-link">
        <Link href={`/${locale}/legal`}>{t.legal}</Link>
      </p>
    </main>
  );
}
