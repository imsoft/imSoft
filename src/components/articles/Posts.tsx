import { getPostsMeta } from "@/lib/posts";
import ListItem from "./ListItem";
import MessageComponent from "../ui/shared/MessageComponent";

const Posts = async () => {
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
    <>
      <div className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Nuestro Blog
            </h2>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              Aprenda a hacer crecer su negocio con nuestro asesoramiento
              experto.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {posts.map((post) => (
              <>
                <ListItem key={post.title} post={post} />
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Posts;
