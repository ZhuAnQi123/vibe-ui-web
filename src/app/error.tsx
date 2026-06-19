"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset?: () => void;
}) {
  useEffect(() => {
    // Log the error for debugging
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div style={{padding:32}}>
      <h1>Something went wrong</h1>
      <p>{error?.message}</p>
      <button onClick={() => reset?.()}>Try again</button>
    </div>
  );
}
