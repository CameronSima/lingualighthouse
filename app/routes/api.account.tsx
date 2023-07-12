import { LoaderArgs } from "@remix-run/node";
import { json } from "react-router";
import { getUser, getUserId, isLoggedIn } from "~/session.server";

// use this endpoint to get userData client-side using fetcher,
// so that we can cache pages and still show custom header
export const loader = async ({ request }: LoaderArgs) => {
  // if user has a session, return user object

  let user;
  if (await isLoggedIn(request)) {
    user = await getUser(request);
  }
  console.log({ user });
  return json({ user });
};
