
import Pusher from "pusher"
import { env } from "~/env";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForSoketi = globalThis as unknown as {
  pusher: Pusher | undefined;
};

export const pusher =
  globalForSoketi.pusher ?? new Pusher({
    key: "app-key",
    secret: "app-secret",
    appId: "app-id",
    host: '127.0.0.1',
    port: "6001",
    useTLS: false,
  })


if (env.NODE_ENV !== "production") globalForSoketi.pusher = pusher;

