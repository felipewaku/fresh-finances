import { Handlers } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie.ts";

export const handler: Handlers = {
  async POST(req) {
    const cookies = getCookies(req.headers);
    const isAllowed = cookies.auth === "bar";
    if (!isAllowed) {
      return new Response(null, {
        status: 403,
      });
    }
    const form = await req.formData();
    console.log(Array.from(form.entries()));
    const url = new URL(req.url);
    url.pathname = "/transaction";
    return Response.redirect(url);
  },
};
