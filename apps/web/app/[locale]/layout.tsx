export function generateStaticParams() {
  return [{ locale: 'es' }, { locale: 'en' }];
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
