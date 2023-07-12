import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { User } from "~/models/user.server";

export default function useFetchUser() {
  const fetcher = useFetcher<User>();

  const user =
    fetcher.data && Object.keys(fetcher.data).length > 0
      ? fetcher.data
      : undefined;

  useEffect(() => {
    fetcher.load("api/account");
  }, []);

  return { fetcher, user };
}
