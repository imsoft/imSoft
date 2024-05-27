import { Metadata } from "next";
import Posts from "@/components/articles/Posts";
import { getPostsMeta } from "@/lib/posts";
import MessageComponent from "@/components/ui/shared/MessageComponent";

export const metadata: Metadata = {
  title: "Artículos",
  description: "Artículos, imSoft",
  keywords: ["imSoft", "Articulos", "Blog"],
  twitter: {
    title: "Artículos",
    description: "Artículos, imSoft",
  },
  openGraph: {
    title: "Artículos",
    description: "Artículos, imSoft",
  },
};

export const revalidate = 86400; // un dia en segundos

const ArticlesPage = async () => {
  const posts = await getPostsMeta();

  if (!posts) {
    return (
      <MessageComponent
        topic={"Perdón por las molestias"}
        message={"No hay Posts 😔"}
        comment={"Te recomendamos volver más tarde o recargar el sitio"}
      />
    );
  }

  return (
    <main>
      <Posts />
    </main>
  );
};

export default ArticlesPage;
