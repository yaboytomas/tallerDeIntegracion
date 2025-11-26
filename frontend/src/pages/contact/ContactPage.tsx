export function ContactPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-12 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <header className="text-center">
        <div className="inline-block text-6xl mb-6 animate-float">📞</div>
        <h1 className="heading-artistic mb-6">Contáctanos</h1>
        <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
          ✨ Estamos aquí para asesorarte en productos, pedidos y capacitaciones
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card-premium rounded-3xl border-2 border-transparent bg-white p-8 shadow-2xl animate-scale-in"
          style={{
            background: `linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea, #764ba2) border-box`,
            animationDelay: '100ms'
          }}
        >
          <div className="inline-block px-4 py-2 mb-6 rounded-full bg-gradient-to-r from-purple-100 to-pink-100">
            <h2 className="text-xl font-black text-gradient">
              📧 Información de Contacto
            </h2>
          </div>
          <ul className="mt-6 space-y-4 text-neutral-700">
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">📱</span>
              <div>
                <div className="font-bold text-purple-900">Teléfono</div>
                <div className="text-sm mt-1">+56 9 1234 5678</div>
                <div className="text-xs text-neutral-500 mt-1">Lun-Vie 09:00 a 18:00</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">💼</span>
              <div>
                <div className="font-bold text-purple-900">Correo Ventas</div>
                <div className="text-sm mt-1">ventas@jspdetailing.cl</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">🛠️</span>
              <div>
                <div className="font-bold text-purple-900">Correo Postventa</div>
                <div className="text-sm mt-1">postventa@jspdetailing.cl</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-purple-50 transition-all">
              <span className="text-2xl">📍</span>
              <div>
                <div className="font-bold text-purple-900">Dirección</div>
                <div className="text-sm mt-1">Av. Las Palmeras 1234</div>
                <div className="text-xs text-neutral-500 mt-1">Huechuraba, Santiago</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="card-premium rounded-3xl border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8 shadow-2xl animate-scale-in flex items-center justify-center"
          style={{animationDelay: '200ms'}}
        >
          <div className="text-center">
            <div className="text-6xl mb-4">✉️</div>
            <div className="badge-artistic mb-4 inline-block">Próximamente</div>
            <p className="text-neutral-700 leading-relaxed">
              Estamos preparando un formulario completo para solicitar cotizaciones, 
              agendar retiros y coordinar capacitaciones.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

