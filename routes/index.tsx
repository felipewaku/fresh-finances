import { Head } from "$fresh/runtime.ts";
import type { Handlers, PageProps } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie.ts";
import { getDBConnection } from "../data/db.connection.ts";
import Counter from "../islands/Counter.tsx";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const isAllowed = cookies.auth === "bar";
    if (!isAllowed) {
      const url = new URL(req.url);
      url.pathname = "login";
      return Response.redirect(url);
    }

    const connection = await getDBConnection();
    console.log(
      await connection.queryArray({
        args: [1],
        text: "SELECT $1",
      })
    );
    connection.release();

    return ctx.render!({ isAllowed });
  },
};

export default function Home({ data }: PageProps<{ isAllowed: boolean }>) {
  return (
    <>
      <Head>
        <title>Fresh App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <img
          src="/logo.svg"
          class="w-32 h-32"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class="my-6">
          Welcome to `fresh`. Try updating this message in the
          ./routes/index.tsx file, and refresh.
        </p>
        <Counter start={3} />
      </div>
    </>
  );
}
