import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import HasilPerebusan from './hasilperebusan';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { manualBatch } from '~/server/db/schema';

export default async function HasilPerebusanPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousBatches = await db.query.manualBatch.findMany({
        where: eq(manualBatch.status, "pending"),
        with: {
            user: true,
            manualBatchProducts: true,
        },
        orderBy: (manualBatch, { desc }) => [desc(manualBatch.createdAt)]
    });

    return (
        <HasilPerebusan session={session} previousBatches={previousBatches}  />
    )
}