"use client"


import { db } from "~/server/db";
import { AppSidebar } from "../sidebar";
import { ManualBatch } from "../manual/manual";
import { DataTable } from "./datatable";
import { ColumnDef } from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { Suspense, useEffect } from "react";
import Pusher from 'pusher-js';
import * as PusherTypes from 'pusher-js';

export default function MonitoringPage() {

    const [{batches, grinding}, previousBatchesQuery] = api.product.getMonitoring.useSuspenseQuery()

    
    useEffect(() => {
        const pusher = new Pusher('90ec2f2ea2d4d47ed238', {
            cluster: 'ap1'
        });    

        pusher.subscribe('monitoring').bind('update', (message : {
            message: string
        }) => {
            console.log(message.message);
            previousBatchesQuery.refetch().catch(console.error)
        });
    }, [])  

    

    return (
        <>
            <AppSidebar />
            <main className="min-h-screen w-full ">
                <div className="flex flex-row justify-between h-24 bg-gradient-to-r from-[#273F7F] to-[#389CB7]  text-white relative top-0 p-8  ">
                    <h1 className=" text-2xl font-bold">Traceability Monitoring</h1>
                    <h1 className=" text-2xl font-bold">{Intl.DateTimeFormat('id-ID').format(Date.now())}</h1>
                </div>
                <Suspense>
                    <DataTable previousBatches={batches} previousGrinding={grinding} />
                </Suspense>
            </main>
        </>
    )
}


