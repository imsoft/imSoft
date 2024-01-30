import Image from "next/image";
import Link from "next/link";
import { RequiredMetatags } from "@/interfaces";
import { getFormattedDate } from "@/utils/getFormattedDate";

interface Props {
  post: RequiredMetatags;
}

const PostCard = ({ post }: Props) => {
  const {
    _id,
    title,
    description,
    keywords,
    author,
    subject,
    date,
    type,
    source,
    image,
    url,
    robots,
    tags,
  } = post;
  const formattedDate = getFormattedDate(date);

  return (
    <article
      key={_id}
      className="relative isolate flex flex-col justify-end overflow-hidden rounded-2xl bg-gray-900 px-8 pb-8 pt-80 sm:pt-48 lg:pt-80"
    >
      <Image
        src={image}
        alt={title}
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        width={332}
        height={488}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-gray-900 via-gray-900/40" />
      <div className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

      <div className="flex flex-wrap items-center gap-y-1 overflow-hidden text-sm leading-6 text-gray-300">
        <time dateTime={formattedDate} className="mr-8">
          {date}
        </time>
        <div className="-ml-4 flex items-center gap-x-4">
          <svg
            viewBox="0 0 2 2"
            className="-ml-0.5 h-0.5 w-0.5 flex-none fill-white/50"
          >
            <circle cx={1} cy={1} r={1} />
          </svg>
          <div className="flex gap-x-2.5">
            <Image
              src={
                "https://res.cloudinary.com/https-imsoft-io/image/upload/v1706594670/imsoft-images/imsoft/isotipo-imsoft-cuadrado.png"
              }
              alt={title}
              className="h-6 w-6 flex-none rounded-full bg-white/10"
              width={650}
              height={650}
            />
            {author}
          </div>
        </div>
      </div>
      <h3 className="mt-3 text-lg font-semibold leading-6 text-white">
        <Link href={`/articulos/${_id}`}>
          <span className="absolute inset-0" />
          {title}
        </Link>
      </h3>
    </article>
  );
};

export default PostCard;
