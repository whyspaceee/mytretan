import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import Manual from "../manual/manual";
import MonitoringPage from "./monitoring";

export default async function MonitoringPageStatic() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    return (
        <MonitoringPage />
    )
}