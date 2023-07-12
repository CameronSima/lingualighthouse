import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useContext, useEffect } from "react";

import stylesheet from "~/tailwind.css";
import icon from "../public/lighthouse.png";
import { UserContext, UserProvider } from "./context/userContext";
import useIsPageLoaded from "./hooks/pageLoaded";
import initRum from "./rum";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  // NOTE: Architect deploys the public directory to /_static/
  { rel: "icon", href: "/_static/favicon.ico" },
];

export default function App() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      initRum()
        .then(() => console.log("RUM initialized"))
        .catch((err) => console.error("Error initializing RUM", err));
    }
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <UserProvider>
          <>
            <Header />
            <Outlet />
          </>
        </UserProvider>

        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

function Header() {
  const pageLoaded = useIsPageLoaded();
  const user = useContext(UserContext);

  console.log(pageLoaded, user);

  return (
    <header className="bg-white">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Lingua Lighthouse</span>
            <img className="h-8 w-auto" src={icon} alt="" />
          </a>
        </div>

        <Link
          to="/about"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          About
        </Link>

        <div className="gap-6 lg:flex lg:flex-1 lg:justify-end">
          {!pageLoaded ? (
            <></>
          ) : !Boolean(user) ? (
            <Link
              to="login"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Log in <span>&rarr;</span>
            </Link>
          ) : (
            <Link
              to="account"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Account
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
