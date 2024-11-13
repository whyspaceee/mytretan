import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(z.object({ email: z.string().min(1), password: z.string().min(1), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(users).values({
        name: input.name,
        email: input.email,
        password: input.password,
      });
    }),
});
