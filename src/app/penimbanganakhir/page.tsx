import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import HasilPerebusan from './hasilpenimbangan';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { grinding, manualBatch } from '~/server/db/schema';
import HasilPenimbanganAkhir from './hasilpenimbangan';
import { getGrindingDataWithSlug } from '~/lib/getBatchData';

export default async function HasilPenimbanganAkhirPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousGrinding = await getGrindingDataWithSlug()

    return (
        <HasilPenimbanganAkhir session={session} previousGrinding={previousGrinding}  />
    )
}