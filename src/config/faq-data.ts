export interface Faq {
  q: string;
  a: string;
}

/**
 * Preguntas frecuentes de la home. Fuente única para el componente visual
 * (FaqSection) y para el JSON-LD FAQPage que habilita rich snippets en Google.
 */
export const faqs: Record<'es' | 'en', Faq[]> = {
  es: [
    {
      q: '¿Cuánto cuesta mi proyecto?',
      a: 'Cada proyecto recibe una propuesta con precio fijo en un máximo de 48 horas. No cobramos por hora ni hay sorpresas al final: sabes exactamente cuánto vas a pagar antes de empezar.',
    },
    {
      q: '¿Cuánto tardan en entregar?',
      a: 'Depende del alcance: una landing page en 1 semana, una página web profesional en 2–3 semanas y un MVP funcional en 6–8 semanas. En la propuesta te damos una fecha de entrega concreta.',
    },
    {
      q: '¿El código es mío?',
      a: 'Sí, el 100% del código es tuyo. Sin licencias recurrentes ni dependencias atadas a nosotros. Te entregamos todo y puedes llevártelo cuando quieras.',
    },
    {
      q: '¿Dan soporte y mantenimiento después de entregar?',
      a: 'Sí. Todos los proyectos incluyen soporte tras la entrega y ofrecemos planes de mantenimiento continuo para que tu plataforma siga creciendo y actualizada.',
    },
    {
      q: '¿Trabajan con empresas fuera de Guadalajara o de México?',
      a: 'Por supuesto. Trabajamos de forma remota con clientes en todo México y el extranjero. La comunicación es constante y tienes visibilidad del avance en todo momento.',
    },
    {
      q: '¿Cómo empiezo?',
      a: 'Agenda una llamada gratis. Platicamos tu idea, resolvemos tus dudas y, si encajamos, te enviamos una propuesta con precio fijo. Sin compromiso.',
    },
  ],
  en: [
    {
      q: 'How much will my project cost?',
      a: 'Every project gets a fixed-price proposal within 48 hours. We don’t charge by the hour and there are no surprises at the end: you know exactly what you’ll pay before we start.',
    },
    {
      q: 'How long does delivery take?',
      a: 'It depends on scope: a landing page in 1 week, a professional website in 2–3 weeks, and a functional MVP in 6–8 weeks. The proposal includes a concrete delivery date.',
    },
    {
      q: 'Do I own the code?',
      a: 'Yes, 100% of the code is yours. No recurring licenses, no lock-in. We hand everything over and you can take it with you whenever you want.',
    },
    {
      q: 'Do you offer support and maintenance after delivery?',
      a: 'Yes. Every project includes post-delivery support, and we offer ongoing maintenance plans so your platform keeps growing and stays up to date.',
    },
    {
      q: 'Do you work with companies outside Guadalajara or Mexico?',
      a: 'Absolutely. We work remotely with clients across Mexico and abroad. Communication is constant and you have visibility into progress at all times.',
    },
    {
      q: 'How do I get started?',
      a: 'Book a free call. We’ll talk through your idea, answer your questions, and if we’re a good fit, send you a fixed-price proposal. No commitment.',
    },
  ],
};
