interface ProblemsSectionProps {
  title: string;
  problems: string[];
}

export function ProblemsSection({ title, problems }: ProblemsSectionProps) {
  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          {title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                ✕
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {problem}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
