import ListItem from "@/components/articles/ListItem";
import MessageComponent from "@/components/ui/shared/MessageComponent";
import { getPostsMeta } from "@/lib/posts";

export const revalidate = 86400; // un dia en segundos

type Props = {
  params: {
    tag: string;
  };
};

export const generateStaticParams = async () => {
  const posts = await getPostsMeta();

  if (!posts) return [];

  const tags = new Set(posts.map((post) => post.tags).flat());

  return Array.from(tags).map((tag) => ({ tag }));
};

export const generateMetadata = ({ params: { tag } }: Props) => {
  return {
    title: `Nuestros asesoramientos para ${tag}`,
  };
};

const TagPostList = async ({ params: { tag } }: Props) => {
  const posts = await getPostsMeta();

  if (!posts)
    return (
      <MessageComponent
        topic={"Perdón por las molestias"}
        message={"No hay Posts disponibles 😔"}
        comment={"Te recomendamos utilizar otra palabra clave"}
      />
    );

  const tagPosts = posts.filter((post) => post.tags.includes(tag));

  if (!tagPosts.length) {
    return (
      <MessageComponent
        topic={"Perdón por las molestias"}
        message={"No hay Posts con esa palabra clave 😔"}
        comment={"Te recomendamos utilizar otra palabra clave"}
      />
    );
  }

  return (
    <>
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nuestros asesoramientos para{" "}
              <p className="mt-2 text-primary-500"> #{tag} </p>
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Aprenda a hacer crecer su negocio con nuestro asesoramiento
              experto.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tagPosts.map((post) => (
              <ListItem key={post._id} post={post} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default TagPostList;
