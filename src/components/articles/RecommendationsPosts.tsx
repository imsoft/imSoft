import React from "react";

import { IPost } from "../../interfaces";
import PostCard from "./PostCard";

interface Props {
  props: IPost[];
}

const RecommendationsPosts = (posts: Props) => {
  return (
    <>
      <div className="relative bg-white px-6 pt-16 pb-20 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="absolute inset-0">
          <div className="h-1/3 bg-white sm:h-2/3" />
        </div>
        <div className="relative mx-auto max-w-7xl">
          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-primary-500 sm:text-3xl">
              ¿Algo más para leer? 📖
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-lg gap-5 lg:max-w-none lg:grid-cols-3">
            {posts.props.map((post) => (
              <PostCard
                key={post.title}
                title={post.title}
                image={post.image}
                slug={post.slug}
                category={post.category}
                description={post.description}
                date={post.date}
                affiliation={post.affiliation}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default RecommendationsPosts;
