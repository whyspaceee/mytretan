import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import HasilPerebusan from './hasilpenimbangan';
import { eq } from 'drizzle-orm';
import { db } from '~/server/db';
import { grinding, manualBatch } from '~/server/db/schema';
import HasilPenimbanganAkhir from './hasilpenimbangan';

export default async function HasilPenimbanganAkhirPage() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const previousGrinding = await db.query.grinding.findMany({
        with: {
            user: true,
            manualBatch: true
        },
        orderBy: (manualBatch, { desc }) => [desc(grinding.createdAt)]
    });

    return (
        <HasilPenimbanganAkhir session={session} previousGrinding={previousGrinding}  />
    )
}