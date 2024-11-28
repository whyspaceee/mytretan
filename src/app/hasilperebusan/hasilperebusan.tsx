"use client"

import { HydrateClient } from "~/trpc/server";
import { AppSidebar } from "../sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "~/components/ui/select";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { type Session, type User } from "next-auth";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { ManualBatch, type ManualBatchWithSlug } from "../manual/manual";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HasilPerebusan({ session, previousBatches }: { session: Session, previousBatches: ManualBatchWithSlug[] }) {
    const [barcode, setBarcode] = useState<string>("")
    const [berat, setBerat] = useState<string>("")
    const [beratError, setBeratError] = useState<string | null>(null)
    const [barcodeError, setBarcodeError] = useState<string | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const router = useRouter()

    console.log(previousBatches)

    const mutation = api.product.updateBatchWeight.useMutation({
        onSuccess: () => {
            setBarcode("")
            setBerat("")
            alert("Data berhasil disimpan")
            router.refresh()
        }
    })

    const onSave = async () => {
        const result = previousBatches.find((batch) => batch.slug === barcode);
        const weight = parseFloat(berat)

        setBeratError(null)
        setBarcodeError(null)

        if (!result) {
            setBarcodeError("Batch tidak ditemukan")
        }

        if (!weight || weight <= 0) {
            setBeratError("Berat tidak valid")
        }

        if (!result || !weight || weight <= 0) {
            return
        }

        const data = { batchId: result.batchId, weight: weight }
        mutation.mutate(data)
    }


    return (
        <>
            <AlertDialog open={dialogOpen} onOpenChange={(val) => setDialogOpen(val)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah data sudah benar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data input susu akan dimasukkan ke dalam database
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onSave}>Lanjut</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AppSidebar /><main className="min-h-screen w-full  ">
                <div className="flex flex-row justify-between h-24 bg-gradient-to-r from-[#273F7F] to-[#389CB7]  text-white relative top-0 p-8  ">
                    <h1 className=" text-2xl font-bold">Hasil Perebusan</h1>
                    <h1 className=" text-2xl font-bold">{Intl.DateTimeFormat('id-ID').format(Date.now())}</h1>
                </div>
                <div className="flex flex-col items-start justify-start ">

                    <div className=" flex flex-col items-start justify-start gap-4 px-8 py-8 ">
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[#2A4F89]">
                            Scan Barcode Batch
                        </h1>
                        <Card className="pt-8">
                            <CardContent>
                                <div className=" flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div className=" flex flex-row gap-2 items-center">
                                            <Label className=" w-32">ID Batch / Barcode</Label>
                                            <Input value={barcode} onChange={
                                                (e) => {
                                                    setBarcode(e.target.value)
                                                }
                                            }
                                                placeholder="ID Produk" />
                                        </div>
                                        {barcodeError && <p className="text-red-500">{barcodeError}</p>}
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className=" flex flex-row gap-2 items-center">
                                            <Label className=" w-32">Berat (kg)</Label>
                                            <Input type="number" min="0" required step="any" value={berat} onChange={
                                                (e) => {
                                                    setBerat(e.target.value)
                                                }
                                            }
                                                placeholder="Berat hasil grinding" />
                                        </div>
                                        {beratError && <p className="text-red-500">{beratError}</p>}

                                    </div>                                </div>
                            </CardContent>
                            <CardFooter>
                                {
                                    <Button className="" onClick={() => setDialogOpen(true)} disabled={mutation.isPending} >
                                        {mutation.isPending ? <LoadingSpinner /> : "Simpan"}
                                    </Button>
                                }
                            </CardFooter>
                        </Card>
                    </div>

                </div>
                <Collapsible defaultOpen={true} className="m-8">
                    <CollapsibleTrigger className=" text-xl font-semibold text-primary inline-flex items-center gap-2">
                        <p>Batch sebelumnya</p>
                        <ChevronsUpDown size={24} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch ID</TableHead>
                                    <TableHead>ID Susu</TableHead>
                                    <TableHead>Jumlah(L)</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat pada</TableHead>
                                    <TableHead>Selesai pada</TableHead>
                                    <TableHead>Berat (Kg)</TableHead>
                                    <TableHead>Pegawai</TableHead>

                                </TableRow>
                            </TableHeader>
                            <TableBody>

                                {previousBatches.map((batch) => (
                                    <TableRow key={batch.batchId}>
                                        <TableCell>{batch.slug}</TableCell> 
                                        <TableCell>
                                            {
                                                batch.manualBatchProducts.map((product) => (
                                                    <p key={product.productId}>{product.productId}</p>
                                                ))
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {
                                                batch.manualBatchProducts.map((product) => (
                                                    <p key={product.productId}>{product.quantity}</p>
                                                ))
                                            }
                                        </TableCell>
                                        <TableCell>{
                                            batch.status === "pending" ? <p className="text-yellow-500">On Process</p> :
                                                batch.status === "completed" ? <p className="text-green-500">Completed</p> :
                                                    batch.status === "grinding" ? <p className="text-green-500">Completed</p> : ""
                                            
                                            }</TableCell>

                                        <TableCell>{Intl.DateTimeFormat('id-ID', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric'
                                        }).format(batch.createdAt)}</TableCell>
                                        <TableCell>
                                            {batch.finishedAt ? Intl.DateTimeFormat('id-ID', {
                                                year: 'numeric',
                                                month: 'numeric',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric'
                                            }).format(batch.finishedAt) : "-"}

                                        </TableCell>
                                        <TableCell>
                                            {batch.weight ? batch.weight : "-"}
                                        </TableCell>
                                        <TableCell>
                                            {batch.userId}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CollapsibleContent>
                </Collapsible>


            </main ></>
    )
}

const dateFormatSchema = z
    .string()
    .regex(/^([A-Z]+)-(\d{6})$/, "Invalid format") // Validate "XY-YYYYMMDD", where XY is any uppercase letters
    .refine((val) => {
        const datePart = val.slice(3); // Get the 6 digits after "SA-"
        const year = parseInt(datePart.slice(0, 2), 10);
        const month = parseInt(datePart.slice(2, 4), 10);
        const day = parseInt(datePart.slice(4, 6), 10);

        // Validate year, month, and day ranges
        const isValidYear = year >= 24 && year <= 99; // Valid 2-digit year
        const isValidMonth = month >= 1 && month <= 12; // Valid month
        const isValidDay = day >= 1 && day <= 31; // Valid day range (basic check)

        // Basic month-day validation
        const daysInMonth = new Date(year, month, 0).getDate(); // Get number of days in the month
        const isValidDate = day <= daysInMonth; // Check if day is valid for the given month

        return isValidYear && isValidMonth && isValidDay && isValidDate;
    }, "Invalid date")
    .transform((val) => {
        const datePart = val.slice(3); // Get the 6 digits after "SA-"
        const supplier = val.slice(1, 2); // Get the 2 uppercase letters
        const year = parseInt("20" + datePart.slice(0, 2), 10);
        const month = parseInt(datePart.slice(2, 4), 10);
        const day = parseInt(datePart.slice(4, 6), 10);
        return {
            supplier,
            date: new Date(year, month - 1, day),
        }; // Return a Date object (month is 0-based)
    });


type BatchesWithWeight = {
    id: string
    weight: number
    user: User
    createdAt: Date
}

