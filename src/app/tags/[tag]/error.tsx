"use client"; // Error components must be Client components

import { useEffect } from "react";
import Link from "next/link";

export const Error = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main className="bg-slate-200 mx-auto max-w-lg py-1 px-4 min-h-screen">
      <h2 className="my-4 text-2xl font-bold">Something went wrong!</h2>
      <button
        className="mb-4 p-4 bg-red-500 text-white rounded-xl"
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Intentalo de nuevo
      </button>
      <p className="text-xl">
        O regresa a{" "}
        <Link href="/" className="underline">
          la pagina principal 🏠
        </Link>
      </p>
    </main>
  );
};

export default Error;
