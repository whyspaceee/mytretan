"use server"
import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import Manual, { ManualBatch } from './manual';
import { db } from '~/server/db';
import { inputProducts, manualBatch } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { getBatchDataWithSlug } from '~/lib/getBatchData';



export default async function ManualPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousBatches = (await getBatchDataWithSlug()).filter((e) => e.status == "pending")


    const freezerItems = await db.select().from(inputProducts)

    //for each batch item, create slug sorted from date time
    //example:  WIP1-241019, WIP2-241019, WIP3-241019



    return (
        <Manual session={session} previousBatches={previousBatches} freezerItems={freezerItems} />
    )
}
