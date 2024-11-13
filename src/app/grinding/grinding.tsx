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
import { Session, User } from "next-auth";
import { api } from "~/trpc/react";
import { LoadingSpinner } from "~/components/ui/spinner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "~/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { ChevronDown, ChevronsUpDown } from "lucide-react";
import { revalidatePath } from "next/cache";
import ReactBarcode from "react-barcode";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import { ManualBatch } from "../manual/manual";

export interface Grinding {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    grindingId: string;
    finishedAt: Date | null;
    status: "pending" | "completed";
    weight: number | null;
    user: {
        id: string;
        name: string;
        email: string;
        password: string;
    };
    manualBatch: {
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: "pending" | "completed" | "grinding";
        weight: number | null;
        batchId: string;
        finishedAt: Date | null;
    }[];
}


export default function Grinding({ session, previousBatches, previousGrinding }: { session: Session, previousBatches: ManualBatch[], previousGrinding: Grinding[] }) {
    const [barcode, setBarcode] = useState<string>("")
    const [barcodeError, setBarcodeError] = useState<string | null>(null)
    const [data, setData] = useState<ManualBatch[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [printDialogData, setPrintDialogData] = useState<string | null>(null)
    const barcodeRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    const reactToPrintFn = useReactToPrint({
        contentRef: barcodeRef,
    });

    const mutation = api.product.inputGrinding.useMutation({
        onSuccess: () => {
            setData([])
            alert("Data berhasil disimpan")
            router.refresh()
        }
    })

    const onSave = async () => {
        if (data.length === 0) {
            return
        }

        const batches = data.map((batch) => batch.batchId)

        await mutation.mutateAsync({
            batchesId: batches
        })
    }


    const onSubmit = () => {
        const productData = previousBatches.find((item) => item.batchId === barcode);

        if (!productData) {
            setBarcodeError("Produk tidak ditemukan")
            return
        }

        setBarcodeError(null)

        setData((prevData) => {
            if (prevData.find((item) => item.batchId === barcode)) {
                return prevData
            }

            return [...prevData, productData]
        });
    };

    const deleteData = (id: string) => {
        const newData = data.filter((item) => item.batchId !== id);
        setData(newData);
    }

    const columns: ColumnDef<ManualBatch>[] = [
        {
            accessorKey: "batchId",
            header: "ID Batch",
        },
        {
            id: "idSusu",
            accessorKey: "manualBatchProducts",
            header: "ID Susu",
            cell: (cell) => cell.row.original.manualBatchProducts.map((product) =>
                <p key={product.productId}>{product.productId}</p>
            )
        },
        {
            id: "jumlahSusu",
            accessorKey: "manualBatchProducts",
            header: "Jumlah (L)",
            cell: (cell) => cell.row.original.manualBatchProducts.map((product) =>
                <p key={product.productId}>{product.quantity}</p>
            )
        },
        {
            accessorKey: "tanggal",
            header: "Tanggal",
            cell: (cell) => {
                const date = cell.getValue() as Date;
                return Intl.DateTimeFormat('id-ID').format(date)
            }
        },
        {
            accessorKey: "finishedAt",
            header: "Selesai pada",
            cell: (cell) => {
                const date = cell.getValue() as Date;
                return date ? Intl.DateTimeFormat('id-ID', {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                }).format(date) : "Belum selesai"
            }
        },
        {
            accessorKey: "weight",
            header: "Berat (Kg)",
        },

        {
            accessorKey: "user",
            header: "Pegawai",
            cell: (cell) => {
                return cell.row.original.user.name
            }
        },
        {
            id: "delete",
            cell: (cell) => {
                return <Button onClick={() => {
                    deleteData(cell.row.original.batchId)
                }}>Delete</Button>
            }
        },

    ]

    return (
        <>
            <AlertDialog open={dialogOpen} onOpenChange={(val) => setDialogOpen(val)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah data sudah benar?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Data input perebusan manual akan dimasukkan ke dalam database
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onSave}>Lanjut</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={!!printDialogData} onOpenChange={
                (val) => {
                    if (!val) {
                        setPrintDialogData(null)
                    }
                }
            }>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cetak barcode?</DialogTitle>
                        {printDialogData && <div ref={barcodeRef}>
                            <ReactBarcode width={1} value={printDialogData} />
                        </div>}
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => {
                            reactToPrintFn()
                        }}>Print</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AppSidebar /><main className="min-h-screen w-full  ">
                <div className="flex flex-row justify-between h-24 bg-gradient-to-r from-[#273F7F] to-[#389CB7]  text-white relative top-0 p-8  ">
                    <h1 className=" text-2xl font-bold">Proses Input Grinding</h1>
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
                                                onKeyDown={
                                                    (e) => {
                                                        if (e.key === "Enter" || e.key === "NumpadEnter") {
                                                            onSubmit()
                                                        }
                                                    }}
                                                placeholder="ID Produk" />
                                        </div>
                                        {barcodeError && <p className="text-red-500">{barcodeError}</p>}
                                    </div>

                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={onSubmit}>Submit</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className="container px-8">
                        <DataTable columns={columns} data={data} />
                    </div>
                    {
                        (data.length > 0) &&
                        <Button className="mx-8 my-4" onClick={() => setDialogOpen(true)} disabled={mutation.isPending} >
                            {mutation.isPending ? <LoadingSpinner /> : "Simpan"}
                        </Button>
                    }
                </div>
                <Collapsible defaultOpen={true} className="m-8">
                    <CollapsibleTrigger className=" text-xl font-semibold text-primary inline-flex items-center gap-2">
                        <p>Grinding aktif</p>
                        <ChevronsUpDown size={24} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product ID</TableHead>
                                    <TableHead>ID Batch</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat pada</TableHead>
                                    <TableHead>Pegawai</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {previousGrinding.map((batch) => (
                                    <TableRow key={batch.grindingId}>
                                        <TableCell>{batch.grindingId}</TableCell>
                                        <TableCell>
                                            {
                                                batch.manualBatch.map((manualBatch) => (
                                                    <p key={manualBatch.batchId}>{manualBatch.batchId}</p>
                                                ))
                                            }
                                        </TableCell>
                                        <TableCell>{batch.status.toUpperCase()}</TableCell>

                                        <TableCell>{Intl.DateTimeFormat('id-ID', {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                            second: 'numeric'
                                        }).format(batch.createdAt)}</TableCell>
                                        <TableCell>{batch.user.name}</TableCell>
                                        <TableCell> <Button onClick={() => {
                                            setPrintDialogData(batch.grindingId)
                                        }}>
                                            Cetak</Button></TableCell>
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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}


export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}