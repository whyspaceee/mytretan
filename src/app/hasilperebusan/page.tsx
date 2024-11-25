import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import HasilPerebusan from './hasilperebusan';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { manualBatch } from '~/server/db/schema';
import { getBatchDataWithSlug } from '~/lib/getBatchData';

export default async function HasilPerebusanPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousBatches = (await getBatchDataWithSlug()).filter((e) => e.status == "pending" || e.status == "completed")
    
    

    return (
        <HasilPerebusan session={session} previousBatches={previousBatches}  />
    )
}