import { Head } from "$fresh/runtime.ts";
import { Handlers } from "$fresh/server.ts";
import { deleteCookie, getCookies } from "std/http/cookie.ts";

export const handler: Handlers = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const isAllowed = cookies.auth === "bar";
    if (isAllowed) {
      const url = new URL(req.url);
      url.pathname = "/transaction";
      return Response.redirect(url);
    } else {
      return ctx.render();
    }
  },
};

export default function Login() {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      <main>
        <div class="p-4 mx-auto max-w-screen-md">
          <form action="/api/login" method="post">
            <label htmlFor="username">Username</label>
            <br />
            <input type="text" name="username" />
            <br />
            <label htmlFor="password">Password</label>
            <br />
            <input type="password" name="password" />
            <br />
            <button type="submit">Submit</button>
          </form>
        </div>
      </main>
    </>
  );
}
