import Posts from "@/components/articles/Posts";
import { getPostsMeta } from "@/lib/posts";
import MessageComponent from "@/components/ui/shared/MessageComponent";

export const revalidate = 86400; // un dia en segundos

const Page = async () => {
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

export default Page;
