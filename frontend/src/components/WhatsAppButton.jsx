const whatsappUrl =
  'https://wa.me/573117006818?text=Hola%2C%20quiero%20conocer%20los%20servicios%20de%20Sur%20Digital.'

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-xl transition hover:scale-105 hover:bg-emerald-600 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber"
      aria-label="Contactar a Sur Digital por WhatsApp"
      title="Escríbenos por WhatsApp"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M16 .5C7.45.5.5 7.35.5 15.8c0 2.67.7 5.29 2.03 7.6L.4 31.5l8.36-2.12a15.7 15.7 0 0 0 7.23 1.76h.01c8.55 0 15.5-6.85 15.5-15.3A15.1 15.1 0 0 0 16 .5Zm0 27.99h-.01c-2.25 0-4.46-.6-6.4-1.74l-.46-.27-4.96 1.26 1.32-4.79-.3-.49a12.55 12.55 0 0 1-1.94-6.66C3.25 8.86 8.97 3.2 16 3.2c3.4 0 6.6 1.3 9 3.67a12.3 12.3 0 0 1 3.74 8.97c0 6.98-5.72 12.65-12.74 12.65Zm6.99-9.48c-.38-.19-2.24-1.1-2.59-1.23-.35-.12-.6-.18-.85.19-.26.38-.98 1.23-1.2 1.48-.22.25-.44.28-.82.09-.38-.19-1.6-.58-3.05-1.84-1.13-.98-1.9-2.19-2.13-2.57-.22-.37-.02-.57.17-.75.17-.17.38-.44.57-.66.19-.22.25-.38.38-.63.13-.25.07-.47-.03-.66-.09-.19-.85-2.02-1.17-2.77-.31-.73-.63-.63-.85-.64l-.73-.02c-.25 0-.66.09-1.01.47-.35.38-1.33 1.29-1.33 3.14s1.36 3.64 1.55 3.89c.19.25 2.67 4.03 6.47 5.65.9.38 1.6.61 2.15.78.9.28 1.72.24 2.37.15.72-.11 2.24-.91 2.56-1.79.32-.88.32-1.63.22-1.79-.1-.16-.35-.25-.73-.44Z" />
      </svg>
    </a>
  )
}
