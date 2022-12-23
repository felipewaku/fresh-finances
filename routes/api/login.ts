import { Handlers } from "$fresh/server.ts";
import { setCookie } from "std/http/cookie.ts";

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const form = await req.formData();
    const username = String(form.get("username"));
    const password = String(form.get("password"));
    console.log(username, password, Deno.env.get("AUTH_USERNAME"));
    if (
      username === Deno.env.get("AUTH_USERNAME") &&
      password === Deno.env.get("AUTH_PASSWORD")
    ) {
      const headers = new Headers();
      setCookie(headers, {
        name: "auth",
        value: "bar",
        maxAge: 120,
        sameSite: "Lax",
        domain: url.hostname,
        path: "/",
        secure: true,
      });
      headers.set("location", "/transaction");
      return new Response(null, {
        status: 303,
        headers,
      });
    } else {
      return new Response(null, {
        status: 403,
      });
    }
  },
};
