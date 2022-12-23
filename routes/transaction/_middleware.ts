import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { getCookies } from "std/http/cookie.ts";

export function handler(req: Request, ctx: MiddlewareHandlerContext) {
  const cookies = getCookies(req.headers);
  const isAllowed = cookies.auth === "bar";
  if (!isAllowed) {
    const url = new URL(req.url);
    url.pathname = "/";
    return Response.redirect(url);
  }
  return ctx.next();
}
