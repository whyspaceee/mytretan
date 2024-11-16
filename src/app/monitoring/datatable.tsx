"use client"
import { ColumnDef, useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table"
import { useMemo } from "react"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "~/components/ui/table"
import { Grinding } from "../grinding/grinding"

interface DataTableProps<TData, TValue> {
    data: TData[],
    columns: ColumnDef<TValue>[],
}

const columns: ColumnDef<Monitoring>[] = [
    {
        accessorKey: "batchId",
        header: "ID Batch",
    },
    {
        id: "manualBatchProducts",
        accessorKey: "manualBatchProducts",
        header: "Kode Produk",
        cell: (cell) => {
            return cell.row.original.manualBatchProducts.map((product) => <p key={product.productId}>{product.productId}</p>)
        }
    },
    {
        id: "qty",
        accessorKey: "manualBatchProducts",
        header: "Jumlah (L)",
        cell: (cell) => {
            return cell.row.original.manualBatchProducts.map((product) => <p key={product.productId}>{product.quantity}</p>)
        }
    },
    {
        accessorKey: "user",
        header: "Pegawai Manual",
        cell: (cell) => {
            return cell.row.original.user.name
        }
    },
    {
        accessorKey: "status",
        header: "Status Perebusan",
        cell: (cell) => {
            if (cell.row.original.status === "pending") {
                return <p className="text-yellow-500">Pending</p>
            }
            if (cell.row.original.status === "completed") {
                return <p className="text-green-500">Completed</p>
            }
            if (cell.row.original.status === "grinding") {
                return <p className="text-green-500">Completed</p>
            }
        }
    },
    {
        accessorKey: "weight",
        header: "Berat (Kg)",
    },
    {
        accessorKey: "finishedAt",
        header: "Waktu Selesai",
        cell: (cell) =>
            cell.row.original.finishedAt ?
                Intl.DateTimeFormat('id-ID',{
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                }).format(new Date(cell.row.original.finishedAt)) : "-"

    },
    // if grinding is started, combine the rows with the same grindingId
    
    {
        id: "grinding",
        accessorKey: "grinding",
        header: "Grinding",
        cell: (cell) => {
            if (cell.row.original.grinding) {
                return cell.row.original.grinding.status.toUpperCase()
            }
            return "-"
        }
    },
    {
        id: "grindingWeight",
        accessorKey: "grinding",
        header: "Grinding Weight",
        cell: (cell) => {
            if (cell.row.original.grinding) {
                return cell.row.original.grinding.weight
            }
            return "-"
        }
    },
    {
        id: "grindingFinishedAt",
        accessorKey: "grinding",
        header: "Grinding Selesai",
        cell: (cell) => {
            if (cell.row.original.grinding) {
                return cell.row.original.grinding.finishedAt ?
                    Intl.DateTimeFormat('id-ID',{
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                    }).format(new Date(cell.row.original.grinding.finishedAt)) : "-"
            }
            return "-"
        }
    },
    {
        accessorKey: "grinding.grindingId",
        header: "ID Produk Akhir"
    }


]




interface Monitoring {
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: "pending" | "completed" | "grinding";
    weight: number | null;
    batchId: string;
    finishedAt: Date | null;
    grindingId: string | null;
    user: {
      name: string;
    };
    manualBatchProducts: {
        productId: string;
        quantity: number;
    }[];
    grinding: {
        grindingId: string;
        status: "pending" | "completed";
        weight: number | null;
        finishedAt: Date | null;
    } | null;
}

export function DataTable({
    data
}: { data: (Monitoring)[] }) {
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

