interface Service {
  title: string;
  description: string;
  icon: string;
}

interface ServicesSectionLandingProps {
  title: string;
  description: string;
  services: Service[];
}

export function ServicesSectionLanding({
  title,
  description,
  services,
}: ServicesSectionLandingProps) {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {description}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-gray-200 dark:border-gray-600"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
