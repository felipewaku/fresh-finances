import { Head } from "$fresh/runtime.ts";

export default function CreateTransaction() {
  return (
    <>
      <Head>
        <title>Nova transação</title>
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
