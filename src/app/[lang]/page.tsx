import { LocaleSwitcher } from "@/components/ui/shared";
import { LanguageProp } from "@/interfaces";
import { getDictionary } from "@/lib/dictionary";

const LanguagesPage = async ({ params: { lang } }: LanguageProp) => {
  const { page } = await getDictionary(lang);
  return (
    <section className="py-24">
      <div className="container">
        <h1 className="text-3xl font-bold">{page.home.title}</h1>
        <p className="text-gray-500">{page.home.description}</p>
        <LocaleSwitcher />
      </div>
    </section>
  );
};

export default LanguagesPage;
