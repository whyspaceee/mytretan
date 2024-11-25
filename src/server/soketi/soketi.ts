
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
    key: "90ec2f2ea2d4d47ed238",
    secret: "470bdc3dfa30ecdd8b33",
    appId: "1901016",
    cluster: "ap1"
  })


if (env.NODE_ENV !== "production") globalForSoketi.pusher = pusher;

