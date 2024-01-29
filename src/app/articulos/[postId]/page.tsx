import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPostByName,
  getPostsMeta,
  getPostsMetaRandom,
} from "../../../lib/posts";
import ListItem from "@/components/articles/PostCard";

export const revalidate = 86400; // un dia en segundos

type Props = {
  params: {
    postId: string;
  };
};

export const generateStaticParams = async () => {
  const posts = await getPostsMeta();

  if (!posts) return [];

  return posts.map((post) => ({
    postId: post._id,
  }));
};

export const generateMetadata = async ({ params: { postId } }: Props) => {
  const post = await getPostByName(`${postId}.mdx`);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.requiredMetatags.title,
    description: post.requiredMetatags.description,
    keywords: post.requiredMetatags.keywords,
    twitter: {
      card: "summary_large_image",
      title: post.requiredMetatags.title,
      description: post.requiredMetatags.description,
      images: {
        url: post.requiredMetatags.image,
        alt: post.requiredMetatags.title,
      },
    },
    openGraph: {
      title: post.requiredMetatags.title,
      description: post.requiredMetatags.description,
      type: "article",
      publishedTime: post.requiredMetatags.date,
      authors: [post.requiredMetatags.author],
      url: post.requiredMetatags.url,
      images: [
        {
          url: post.requiredMetatags.image,
          width: 783,
          height: 783,
          alt: post.requiredMetatags.title,
        },
      ],
    },
  };
};

const Post = async ({ params: { postId } }: Props) => {
  const recommendationsPosts = await getPostsMetaRandom(3);
  const post = await getPostByName(`${postId}.mdx`); // deduped!

  console.log('Post: ', post);

  if (!post) notFound();

  if (!recommendationsPosts) notFound();

  const { requiredMetatags, content } = post;

  const tags = requiredMetatags.tags.map((tag, i) => (
    <Link
      key={i}
      className={`inline-flex items-center justify-center gap-x-1 ${
        i === 0 ? "hidden" : ""
      } rounded-full bg-blue-100 px-2 py-2 text-xs font-medium text-blue-700`}
      href={`/tags/${tag}`}
    >
      <svg
        className="h-1.5 w-1.5 fill-blue-500"
        viewBox="0 0 6 6"
        aria-hidden="true"
      >
        <circle cx={3} cy={3} r={3} />
      </svg>
      {tag}
    </Link>
  ));

  return (
    <>
      <div className="mx-auto max-w-7xl items-center px-4 py-5 sm:px-6 sm:py-4 md:justify-start lg:px-8">
        <div className="prose prose-lg prose-indigo max-w-screen-lg mx-auto mt-6 text-gray-500">
          <article>{content}</article>
        </div>
        <section className="mt-24">
          <h3 className="text-3xl mb-10 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Artículos relacionados:
          </h3>
          <div className="space-y-4 space-x-4 flex flex-wrap items-center justify-center mb-10">
            {tags}
          </div>
        </section>
        <section className="mt-24">
          <h3 className="text-3xl mb-10 font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tambien puedes leer:
          </h3>

          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mt-16 grid max-w-2xl auto-rows-fr grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {recommendationsPosts.map((post) => (
                <ListItem key={post.title} post={post} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Post;
