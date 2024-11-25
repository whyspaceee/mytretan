"use client"
import { type ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { useMemo } from "react"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "~/components/ui/table"
import { Grinding, type GrindingWithSlug } from "../grinding/grinding"
import { type ManualBatchWithSlug } from "../manual/manual"

interface DataTableProps<TData, TValue> {
    data: TData[],
    columns: ColumnDef<TValue>[],
}
const columns: ColumnDef<Monitoring>[] = [
    {
        id: "batchId",
        accessorKey: "manualBatch.slug",
        header: "ID Perebusan",
        cell: (cell) => cell.row.original.manualBatch?.map((e) => <p key={e.manualBatchId}>{e.slug}</p> )

    },
    {
        id: "manualBatch",
        accessorKey: "manualBatch.status",
        header: "Status Perebusan",
        cell: (cell) => {
            return cell.row.original.manualBatch?.map((e) => {
                console.log("manualgtw", e.status)

                if (e.status == "pending") {
                    return <p key={e.manualBatchId} className="text-yellow-500">On Process</p>;
                }
                if (e.status == "completed") {
                    return <p key={e.manualBatchId} className="text-green-500">Completed</p>;
                }
                if (e.status == "grinding") {
                    return <p key={e.manualBatchId} className="text-green-500">Completed</p>;
                }
            })
        },


    },
    {
        id: "susu",
        accessorKey: "manualBatch.manualBatchProducts",
        header: "Susu",
        cell : (cell) => 
            cell.row.original.manualBatch?.map((e) => {
                return e.manualBatchProducts?.map((product) => {
                        return <p key={product.productId}> {product.productId} </p>
                    
                })
            })
        

    },
    {
        id: "qty",
        accessorKey: "manualBatch.manualBatchProducts",
        header: "Jumlah (L)",
        cell : (cell) => 
            cell.row.original.manualBatch?.map((e) => {
                return e.manualBatchProducts?.map((product) => {
                        return <p key={product.productId}> {product.quantity} </p>
                    
                })
            })
        

    },
    {
        id: "manualBatchFinishedAt",
        accessorKey: "manualBatch",
        header: "Waktu Perebusan Selesai",
        cell: (cell) => 
            cell.row.original.manualBatch?.map((e) => {
                if (e.finishedAt) {
                    return <p key={e.manualBatchId}>{Intl.DateTimeFormat("id-ID", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                    }).format(new Date(e.finishedAt))}
                    </p>
                }
                return "-"
            })
        ,
    },
    {
        id: "manualBatchWeight",
        accessorKey: "manualBatch",
        header: "Berat (Kg)",
        cell: (cell) => 
            cell.row.original.manualBatch?.map((e) => {
                if (e.weight) {
                    return <p key = {e.manualBatchId}> {e.weight}</p>
                }
                return "-"
            })
        ,
    },
    {
        id: "pekerjaperebusan",
        accessorKey: "manualBatch",
        header: "Pekerja P.",
        cell: (cell) => cell.row.original.manualBatch?.map((e) => <p key={e.manualBatchId}>{e.userId}</p>), 
    },

    {
        accessorKey: "status",
        header: "Status GnM",
        cell: (cell) => {
            if (cell.row.original.status === "pending") {
                return <p className="text-yellow-500">On Process</p>;
            }
            if (cell.row.original.status === "completed") {
                return <p className="text-green-500">Completed</p>;
            }
        },
    },
    {
        accessorKey: "finishedAt",
        header: "Waktu Selesai",
        cell: (cell) =>
            cell.row.original.finishedAt
                ? Intl.DateTimeFormat("id-ID", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                }).format(new Date(cell.row.original.finishedAt))
                : "-",
    },

    {
        accessorKey: "weight",
        header: "Berat (Kg)",
    },
    {
        accessorKey: "userId",
        header: "Pekerja GnM",
    },
    {
        accessorKey: "slug",
        header: "ID Produk",
    },

    // Combine rows with the same manualBatchId if manualBatch is active
];





interface Monitoring {
    createdAt: Date | null;
    userId: string | null;
    status: string | null;
    weight: number | null;
    grindingId: string | null;
    finishedAt: Date | null;
    slug: string | null;
    manualBatch?: {
        manualBatchId: string;
        status: string;
        slug: string;
        weight: number | null;
        finishedAt: Date | null;
        userId: string
        manualBatchProducts?: {
            productId: string;
            quantity: number;
        }[];
    }[];
}

export function DataTable({
    previousBatches,
    previousGrinding
}: {
    previousBatches: (ManualBatchWithSlug)[],
    previousGrinding: (GrindingWithSlug[])
}) {

    console.log("prev",previousGrinding)

    const data = useMemo(() => {
        const batchesPriorToGrinding = previousBatches.filter((batch) => !batch.grindingId).map((batch) => ({
            createdAt: null,
            userId: null,
            status: null,
            weight: null,
            grindingId: null,
            finishedAt: null,
            slug: null,
            manualBatch: [{
                slug: batch.slug,
                userId: batch.userId,
                manualBatchId: batch.batchId,
                status: batch.status,
                weight: batch.weight,
                finishedAt: batch.finishedAt,
                manualBatchProducts: batch.manualBatchProducts,
            }]

        })
        )

        const previousGrindingMonitoringFormat = previousGrinding.map((grinding) => ({
            createdAt: grinding.createdAt,
            userId: grinding.userId,
            status: grinding.status,
            weight: grinding.weight,
            grindingId: grinding.grindingId,
            finishedAt: grinding.finishedAt,
            slug: grinding.slug,
            manualBatch: grinding.manualBatch.map((batch) => ({
                slug: batch.slug,
                userId: batch.userId,
                manualBatchId: batch.batchId,
                status: batch.status,
                weight: batch.weight,
                finishedAt: batch.finishedAt,
                manualBatchProducts: batch.manualBatchProducts,
            }))
        }))




        return [...batchesPriorToGrinding, ...previousGrindingMonitoringFormat]
    }, [previousBatches, previousGrinding])


    console.log("data", data)

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
                    )

                        : (
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

