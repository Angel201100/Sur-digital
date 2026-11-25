const datos = [
  { etiqueta: 'Correo electrónico', valor: 'contacto@nododigital.com', href: 'mailto:contacto@nododigital.com' },
  { etiqueta: 'Teléfono', valor: '+57 300 000 0000', href: 'tel:+573000000000' },
  { etiqueta: 'Dirección', valor: 'Calle 10 # 20-30, Oficina 701' },
  { etiqueta: 'Horario', valor: 'Lunes a viernes, 8:00 a. m. a 5:00 p. m.' },
]

export default function Contacto() {
  return (
    <section className="page container">
      <h1>Contacto</h1>
      <p className="lead">Cuéntanos qué necesitas y te respondemos en un día hábil.</p>

      <dl className="contact-list">
        {datos.map(({ etiqueta, valor, href }) => (
          <div className="contact-list__item" key={etiqueta}>
            <dt>{etiqueta}</dt>
            <dd>{href ? <a href={href}>{valor}</a> : valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
