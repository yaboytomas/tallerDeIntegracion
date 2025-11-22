export function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Contáctanos</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Estamos disponibles para asesorarte en productos, pedidos y capacitaciones.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900">
            Información de contacto
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-600">
            <li>
              <span className="font-medium text-neutral-700">Teléfono:</span>{" "}
              +56 9 1234 5678 (Lunes a viernes 09:00 a 18:00)
            </li>
            <li>
              <span className="font-medium text-neutral-700">Correo ventas:</span>{" "}
              ventas@jspdetailing.cl
            </li>
            <li>
              <span className="font-medium text-neutral-700">Correo postventa:</span>{" "}
              postventa@jspdetailing.cl
            </li>
            <li>
              <span className="font-medium text-neutral-700">Dirección comercial:</span>{" "}
              Av. Las Palmeras 1234, Huechuraba, Santiago
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-sm text-neutral-500">
          <p>
            Pronto podrás completar un formulario con validación para solicitar
            cotizaciones, agendar retiros y coordinar capacitaciones.
          </p>
        </div>
      </div>
    </section>
  );
}

