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

export default function Kedatangan({ session }: { session: Session }) {
    const freezers = Array.from({ length: 8 }, (_, i) => i + 1)
    const [barcode, setBarcode] = useState<string>("")
    const [barcodeError, setBarcodeError] = useState<string | null>(null)
    const [data, setData] = useState<InputFreezer[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const mutation = api.product.inputProducts.useMutation({
        onSuccess: () => {
            setData([])
            alert("Data berhasil disimpan")
        }
    })

    const onSave = async () => {
        if (data.length === 0) {
            return
        }
        mutation.mutate(
            data.map((item) => ({
                id: item.id,
                amount: item.jumlah,
                supplier: item.supplier,
                date: item.tanggal
            })),
        )
    }


    const onSubmit = () => {
        const result = dateFormatSchema.safeParse(barcode);

        const handleErrors = () => {
            setBarcodeError(result.success ? null : "Format barcode tidak sesuai");
        };

        if (!result.success) {
            handleErrors();
            return;
        }

        handleErrors(); // Clear errors if validation passes

        const { supplier, date } = result.data;

        setData((prevData) => {
            // Find the item with matching id and freezer
            const existingItem = prevData.find(
                (item) => item.id === barcode
            );

            return existingItem
                ? // Update jumlah if item exists
                prevData.map((item) =>
                    item === existingItem
                        ? { ...item, jumlah: item.jumlah + 1 }
                        : item
                )
                : // Add new item if no match
                [
                    ...prevData,
                    {
                        id: barcode,
                        jumlah: 1,
                        supplier,
                        tanggal: date,
                    },
                ];
        });
    };

    const deleteData = (id: string) => {
        const newData = data.filter((item) => item.id !== id);
        setData(newData);
    }

    const columns: ColumnDef<InputFreezer>[] = [
        {
            accessorKey: "id",
            header: "ID Produk",
        },
        {
            accessorKey: "jumlah",
            header: "Jumlah",
            cell: (cell) => {
                return <Input type="number" className=" w-24" value={cell.row.original.jumlah} onChange={
                    (e) => {
                        const newValue = parseInt(e.target.value)
                        if (newValue > 0) {
                            const updatedData = [...data];
                            updatedData[cell.row.index]!.jumlah = parseInt(e.target.value)
                            setData(updatedData)
                        }
                    }
                } />
            }
        },
        {
            accessorKey: "supplier",
            header: "Supplier",
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
            id: "delete",
            cell: (cell) => {
                return <Button onClick={() => {
                    deleteData(cell.row.original.id)
                }}>Delete</Button>
            }
        }

    ]

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
                    <h1 className=" text-2xl font-bold">Kedatangan Susu</h1>
                    <h1 className=" text-2xl font-bold">{Intl.DateTimeFormat('id-ID').format(Date.now())}</h1>
                </div>
                <div className="flex flex-col items-start justify-start ">

                    <div className=" flex flex-col items-start justify-start gap-4 px-8 py-8 ">
                        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl text-[#2A4F89]">
                            Scan Barcode Produk
                        </h1>
                        <Card className="pt-8">
                            <CardContent>
                                <div className=" flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div className=" flex flex-row gap-2 items-center">
                                            <Label className=" w-32">ID Produk / Barcode</Label>
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
                                <Button ref={buttonRef} onClick={onSubmit}>Submit</Button>
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


type InputFreezer = {
    id: string
    jumlah: number
    supplier: string
    tanggal: Date
}

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
