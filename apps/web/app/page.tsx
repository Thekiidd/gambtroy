const cards = [
  {
    title: 'Bloqueo de sitios',
    description: 'Administra una lista de dominios de apuestas bloqueados.'
  },
  {
    title: 'Registro de pérdidas',
    description: 'Captura tus pérdidas y revisa tendencias por semana y mes.'
  },
  {
    title: 'Guardianes',
    description: 'Invita a una persona de confianza para apoyo y aprobación de desbloqueos.'
  }
];

export default function HomePage() {
  return (
    <main className="container">
      <h1>GambTroy</h1>
      <p>Base del MVP lista: frontend + API + schema inicial.</p>
      <section className="grid">
        {cards.map((card) => (
          <article className="card" key={card.title}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
