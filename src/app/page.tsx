import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { AppSidebar } from "./sidebar";




export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>

      {session && <AppSidebar />}
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-[#273F7F] to-[#389CB7] text-white w-full">
        <div className="container flex flex-col items-start justify-start gap-4 px-4 py-16 max-w-5xl">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Selamat Datang di MyTretan
            PT Etta Indotama
          </h1>
          <div className="flex flex-col items-start gap-2">
            {
              session?.user && <p>Logged in as {session?.user.name}</p>

            }
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>

          </div>
        </div>
      </main>

    </HydrateClient>
  );
}
