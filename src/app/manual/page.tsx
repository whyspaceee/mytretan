"use server"
import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import Manual, { ManualBatch } from './manual';
import { db } from '~/server/db';
import { inputProducts, manualBatch } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';



export default async function ManualPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousBatches = await db.query.manualBatch.findMany({
        where:  eq(manualBatch.status, "pending"),
        with: {
            user: true,
            manualBatchProducts: true
        },
        orderBy: (manualBatch, { desc }) => [desc(manualBatch.createdAt)]
    });

    const freezerItems = await db.select().from(inputProducts)



    return (
        <Manual session={session} previousBatches={previousBatches} freezerItems={freezerItems} />
    )
}
