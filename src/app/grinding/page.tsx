"use server"
import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import { db } from '~/server/db';
import { grinding, inputProducts, manualBatch } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';
import Grinding from './grinding';
import { ManualBatch } from '../manual/manual';



export default async function GrindingPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousBatches = await db.query.manualBatch.findMany({
        where:eq(manualBatch.status, "completed"),
        with: {
            user: true,
            manualBatchProducts: true
        },
        orderBy: (manualBatch, { desc }) => [desc(manualBatch.createdAt)]
    }) satisfies ManualBatch[];

    const previousGrinding = await db.query.grinding.findMany({
        where: eq(grinding.status, "pending"),
        with: {
            user: true,
            manualBatch: true
        },
        orderBy: (grinding, { desc }) => [desc(grinding.createdAt)]
    }) 

    console.log(previousGrinding)




    return (
        <Grinding session={session} previousBatches={previousBatches} previousGrinding={previousGrinding} />
    )
}
