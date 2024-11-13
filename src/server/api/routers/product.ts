import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { grinding, inputProducts, manualBatch, manualBatchToProducts, users } from "~/server/db/schema";

export const productRouter = createTRPCRouter({
  inputProducts: protectedProcedure.
    input(z.array(z.object({ id: z.string(), amount: z.number().positive(), supplier: z.string(), date: z.date() })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const values = input.map((product) => ({
        productId: product.id,
        userId,
        quantity: product.amount,
        supplier: product.supplier,
        productdate: product.date,
      }));

      await ctx.db.insert(inputProducts).values(values).onConflictDoUpdate({
        target: [inputProducts.productId],
        set: {
          quantity: sql`${inputProducts.quantity} + EXCLUDED.quantity`,
        },
      });
    }),

  getProductAmount: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.query.inputProducts.findMany({
        where: eq(inputProducts.productId, input),
        columns: { quantity: true }
      });
      return products.reduce((acc, product) => acc + product.quantity, 0);
    }),

  inputManualBatch: protectedProcedure
    .input(z.object({ products: z.array(z.object({ id: z.string(), amount: z.number().positive() })) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const batchId = crypto.randomUUID();

      await ctx.db.insert(manualBatch).values({
        batchId,
        userId,
        status: "pending",
      })

      await ctx.db.insert(manualBatchToProducts).values(
        input.products.map((product) => ({
          batchId: batchId,
          productId: product.id,
          quantity: product.amount,
        }))
      );


    }),

  updateBatchWeight: protectedProcedure
    .input(z.array(z.object({ batchId: z.string(), weight: z.number().positive() })))
    .mutation(async ({ ctx, input }) => {
      for (const batch of input) {
        await ctx.db.update(manualBatch).set({
          weight: batch.weight,
          status: "completed",
          finishedAt: new Date()
        }).where(eq(manualBatch.batchId, batch.batchId));
      }
    }),

  inputGrinding: protectedProcedure
    .input(z.object({ batchesId: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const grindingId = crypto.randomUUID();
      await ctx.db.insert(grinding).values({
        grindingId: grindingId,
        status: "pending",
        userId,
      });

      for (const batch of input.batchesId) {
        console.log("batch", batch)
        await ctx.db.update(manualBatch).set({
          grindingId: grindingId,
          status: "grinding"
        }).where(eq(manualBatch.batchId, batch));
      }
    }),

  finalWeightIn: protectedProcedure
    .input(z.array(z.object({ grindingId: z.string(), weight: z.number().positive() })))
    .mutation(async ({ ctx, input }) => {
      for (const i of input) {
        await ctx.db.update(grinding).set({
          weight: i.weight,
          status: "completed",
          finishedAt: new Date()
        }).where(eq(grinding.grindingId, i.grindingId));
      }
    }),

});

