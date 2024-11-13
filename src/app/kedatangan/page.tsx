import { redirect } from 'next/navigation'
import { auth } from "~/server/auth";
import Kedatangan from './kedatangan';
import { db } from '~/server/db';
import { inputProducts } from '~/server/db/schema';

export default async function KedatanganPage() {
    const session = await auth();



    if (!session) {
        redirect('/');
    }

    return (
        <Kedatangan session={session}  />
    )
}