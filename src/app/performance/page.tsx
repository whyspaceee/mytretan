import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { AppSidebar } from "../sidebar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { db } from "~/server/db";
import { and, eq, gte } from "drizzle-orm";
import { grinding, inputProducts, manualBatch } from "~/server/db/schema";
import { useMemo } from "react";
import Chart from "./charts";
import { pegawaiGrinding, pegawaiPerebusan } from "~/lib/getBatchData";
import { year } from "drizzle-orm/mysql-core";
import Tiles from "./tiles";



export default async function MonitoringPageStatic() {
    const session = await auth();

    if (!session) {
        redirect('/');
    }

    const today = new Date()



    const data = await db.transaction(async (tx) => {
        const milkInventory = await tx
            .select()
            .from(inputProducts)

        const milkToday = milkInventory.filter((milk) => milk.createdAt >= (new Date(today.getFullYear(), today.getMonth(), today.getDate())))
            .reduce((acc, milk) => acc + milk.input, 0)

        const grindingResults = await tx
            .select()
            .from(grinding)
            .where(
                and(eq(grinding.status, "completed"),
                    gte(grinding.createdAt, (new Date(today.getFullYear(), today.getMonth(), today.getDate())))
                ))

        const perebusanResults = (await tx
            .select()
            .from(manualBatch)
            .where(
                and(eq(manualBatch.status, "completed"),
                    gte(manualBatch.createdAt, (new Date(today.getFullYear(), today.getMonth(), today.getDate()))
                    ))
            ))


        return {
            milkInventory: milkInventory.map((milk) => ({
                productId: milk.productId,
                total: milk.quantity
            })),
            totalMilkToday: milkToday,
            remainingMilk: milkInventory.reduce((acc, milk) => acc + milk.quantity, 0),
            totalPowderProduced: grindingResults.reduce((acc, grinding) => acc + (grinding.weight ?? 0), 0),
            grindingPerformance: grindingResults.reduce((acc, grinding) => {
                const existingUser = acc.find((item) => item.userId === grinding.userId);
                if (existingUser) {
                    existingUser.total += grinding.weight ?? 0;
                    return acc;
                }
                return [...acc, {
                    userId: grinding.userId,
                    pegawai: pegawaiGrinding.find((pegawai) => pegawai.id == grinding.userId)?.name ?? "Unknown",
                    total: grinding.weight ?? 0
                }];
            }, [] as { userId: string; pegawai: string; total: number }[]),
            perebusanPerformance: perebusanResults.reduce((acc, perebusan) => {
                const existingUser = acc.find((item) => item.userId === perebusan.userId);
                if (existingUser) {
                    existingUser.total += perebusan.weight ?? 0;
                    return acc;
                }
                return [...acc, {
                    userId: perebusan.userId,
                    pegawai: pegawaiPerebusan.find((pegawai) => pegawai.id == perebusan.userId)?.name ?? "Unknown",
                    total: perebusan.weight ?? 0
                }];
            }, [] as { userId: string; pegawai: string; total: number }[]),

        }
    })

    console.log(data)





    return (
        <div className=" inline-flex w-full">
            <AppSidebar />
            <main className=" min-h-screen w-full">
                <div className="  flex flex-row justify-between h-24 bg-gradient-to-r from-[#273F7F] to-[#389CB7]  text-white relative top-0 p-8  ">
                    <h1 className=" text-2xl font-bold">Performa Harian</h1>
                    <h1 className=" text-2xl font-bold">{Intl.DateTimeFormat('id-ID').format(Date.now())}</h1>
                </div>

                <div className=" inline-flex  w-full p-8 gap-4">
                    <div className=" flex flex-col  h-full   gap-4 ">
                        <Card>
                            <CardHeader>
                                <CardTitle className=" text-2xl font-bold text-primary">Highlight</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className=" flex flex-row flex-wrap gap-4 mb-4">
                                    <Tiles title="Total Milk Today" value={data.totalMilkToday.toString()} />
                                    <Tiles title="Total Powder Produced" value={`${data.totalPowderProduced} Kg`} />
                                    <Tiles title="Remaining Milk" value={data.remainingMilk.toString()} />

                                </div>
                            </CardContent>
                        </Card>
                        <Chart title="Performa Perebusan Hari Ini" data={
                            data.perebusanPerformance
                        } />
                        <Chart title="Performa Grinding Hari Ini" data={
                            data.grindingPerformance
                        } />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Inventaris Susu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No.</TableHead>
                                        <TableHead>ID Produk</TableHead>
                                        <TableHead>Jumlah (L)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {
                                        data.milkInventory.map((item, index) => (
                                            <TableRow key={item.productId}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell>{item.productId}</TableCell>
                                                <TableCell>{item.total}</TableCell>
                                            </TableRow>
                                        ))
                                    }
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </main>
        </div>
    )
}