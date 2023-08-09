import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IPostCard } from "../../interfaces";

const PostCard = ({
  title,
  image,
  slug,
  category,
  description,
  date,
  affiliation,
}: IPostCard) => {
  return (
    <>
      <div
        key={title}
        className="flex flex-col overflow-hidden rounded-lg shadow-lg"
      >
        <div className="flex-shrink-0">
          <Image
            className="h-48 w-full object-cover"
            src={image}
            alt={title}
            width={7952}
            height={5304}
            priority
          />
        </div>
        <div className="flex flex-1 flex-col justify-between bg-white p-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-primary-600">
              <Link href={`/${slug}`} className="hover:underline">
                {category}
              </Link>
            </p>
            <Link href={`/articulos/${slug}`} className="mt-2 block">
              <p className="text-xl font-semibold text-gray-900">{title}</p>
              <p className="mt-3 text-base text-gray-500 line-clamp-4">
                {description}
              </p>
            </Link>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex space-x-1 text-sm text-gray-500">
              <time dateTime={date}>{date}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{affiliation}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostCard;
