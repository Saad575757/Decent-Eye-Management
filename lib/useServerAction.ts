"use client";

import { startTransition, useState, useTransition } from "react";

export function useServerAction<T extends unknown[], R>(
  action: (...args: T) => Promise<R>
) {
  const [isPending, startTransitionLocal] = useTransition();
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<string>("");

  function run(...args: T) {
    return new Promise<void>((resolve) => {
      startTransition(() => {
        Promise.resolve(action(...args))
          .then((res) => {
            setResult(res);
            setError("");
            resolve();
          })
          .catch((err) => {
            setError((err as Error)?.message || "Something went wrong");
            resolve();
          });
      });
    });
  }

  return { run, isPending, result, error, setError };
}
