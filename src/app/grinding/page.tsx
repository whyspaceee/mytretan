"use server"
import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import { db } from '~/server/db';
import { grinding, inputProducts, manualBatch } from '~/server/db/schema';
import { and, eq } from 'drizzle-orm';
import Grinding from './grinding';
import { ManualBatch } from '../manual/manual';
import { getBatchDataWithSlug, getGrindingDataWithSlug } from '~/lib/getBatchData';



export default async function GrindingPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }


    const previousGrinding =  (await getGrindingDataWithSlug()).filter((e) => e.status == "pending")


    const previousBatches =  (await getBatchDataWithSlug()).filter((e) => e.status == "completed")


    return (
        <Grinding session={session} previousBatches={previousBatches} previousGrinding={previousGrinding} />
    )
}
