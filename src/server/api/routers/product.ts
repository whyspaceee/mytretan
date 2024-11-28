import { count, eq, gte, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { pusher } from "~/server/soketi/soketi";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { grinding, inputProducts, manualBatch, manualBatchToProducts, users, } from "~/server/db/schema";
import { getBatchDataWithSlug, getGrindingDataWithSlug } from "~/lib/getBatchData";
import { db } from "~/server/db";



export const productRouter = createTRPCRouter({
  inputProducts: protectedProcedure.
    input(z.array(z.object({ id: z.string(), amount: z.number(), supplier: z.string(), date: z.date() })))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const values = input.map((product) => ({
        productId: product.id,
        userId,
        quantity: product.amount,
        supplier: product.supplier,
        productdate: product.date,
        input: product.amount
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
    .input(z.object({
      products: z.array(z.object({ id: z.string(), amount: z.number() })),
      userId: z.string()
    },))
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId;
      const batchId = crypto.randomUUID();

      const data = await db.transaction(async (tx) => {
        const today = new Date()

        const todaysCount = (await tx
          .select({ count: count().as('count') }) // Assign alias for count
          .from(manualBatch)
          .where(
            gte(manualBatch.createdAt, (new Date(today.getFullYear(), today.getMonth(), today.getDate()))),
          )
        )
        const index = (todaysCount[0]?.count ?? 0) + 1
        console.log("cunt", todaysCount)


        await tx.insert(manualBatch).values({
          batchId,
          userId,
          slug: `W${index}-${today.getFullYear().toString().slice(2, 4)}${today.getMonth() + 1}${today.getDate()}`,
          status: "pending",
        })

        const data = await tx.insert(manualBatchToProducts).values(
          input.products.map((product) => ({
            batchId: batchId,
            productId: product.id,
            quantity: product.amount,
          }))
        ).returning()

        for (const product of input.products) {
          await tx.update(inputProducts).set({
            quantity: sql`${inputProducts.quantity} - ${product.amount}`,
          }).where(eq(inputProducts.productId, product.id));
        }

        return data
      })

      await pusher.trigger("monitoring", "update", {
        message: `new batch : ${data?.at(0)?.batchId}`,
      });

      return data




    }),

  updateBatchWeight: protectedProcedure
    .input(z.object({ batchId: z.string(), weight: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(manualBatch).set({
        weight: input.weight,
        status: "completed",
        finishedAt: new Date()
      }).where(eq(manualBatch.batchId, input.batchId));


      await pusher.trigger("monitoring", "update", {
        message: "batch completed",
      });
    }),

  inputGrinding: protectedProcedure
    .input(z.object({ batchesId: z.array(z.string()), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = input.userId;
      const grindingId = crypto.randomUUID();

      const data = await ctx.db.transaction(async (tx) => {
        const today = new Date()

        const todaysCount = (await tx
          .select({ count: count().as('count') }) // Assign alias for count
          .from(grinding)
          .where(
            gte(grinding.createdAt, (new Date(today.getFullYear(), today.getMonth(), today.getDate()))),
          )
        )
        const index = (todaysCount[0]?.count ?? 0) + 1

        const data = await tx.insert(grinding).values({
          grindingId,
          userId,
          slug: `F${index}-${today.getFullYear().toString().slice(2, 4)}${today.getMonth() + 1}${today.getDate()}`,
          status: "pending",
        }).returning()

        for (const batch of input.batchesId) {
          await tx.update(manualBatch).set({
            grindingId: grindingId,
            status: "grinding"
          }).where(eq(manualBatch.batchId, batch));
        }

        return data
      }
      )



      await pusher.trigger("monitoring", "update", {
        message: "grinding",
      });

      return data;
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

      await pusher.trigger("monitoring", "update", {
        message: "grinding completed",
      });
    }),

  getMonitoring: publicProcedure.query(async ({ ctx }) => {
    const batches = await getBatchDataWithSlug()
    const grinding = await getGrindingDataWithSlug()

    return {
      batches,
      grinding
    }
  }),

  // getPerformance: publicProcedure.query(async ({ ctx }) => {
  //   const data = await db.transaction(async (tx) => {
  //     const milkInventory = await tx
  //       .select()
  //       .from(inputProducts)

  //     const grindingResults = await tx
  //       .select()
  //       .from(grinding)
  //       .where(eq(grinding.status, "completed"))

  //     const perebusanResults = await tx
  //       .select()
  //       .from(manualBatch)
  //       .where(eq(manualBatch.status, "completed"))

  //     return {
  //       milkInventory: milkInventory.map((milk) => ({
  //         productId: milk.productId,
  //         total: milk.quantity
  //       })),
  //       totalMilkToday: milkInventory.reduce((acc, milk) => acc + milk.input, 0),
  //       remainingMilk: milkInventory.reduce((acc, milk) => acc + milk.quantity, 0),
  //       totalPowderProduced: grindingResults.reduce((acc, grinding) => acc + (grinding.weight ?? 0), 0),
  //       grindingPerformance: grindingResults.map((grinding) => ({
  //         userId: grinding.userId,
  //         total: grinding.weight ?? 0
  //       })),  
  //       perebusanPerformance: perebusanResults.map((perebusan) => ({
  //         userId: perebusan.userId,
  //         total: perebusan.weight ?? 0
  //       }))

  //     } satisfies Performance
  //   })

  //   return data
  // })

});

