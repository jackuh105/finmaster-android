import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  TableMeta,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export interface CustomTableMeta<TData> extends TableMeta<TData> {
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onDelete,
  pageCount,
  onPageChange,
  pageIndex
}: DataTableProps<TData, TValue> & {
  pageCount?: number
  onPageChange?: (page: number) => void
  pageIndex?: number
}) {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }])
  const [pageInput, setPageInput] = React.useState(((pageIndex || 0) + 1).toString())

  React.useEffect(() => {
    setPageInput(((pageIndex || 0) + 1).toString())
  }, [pageIndex])

  const table = useReactTable<TData>({
    data,
    columns,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // Removed client-side pagination
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Enable manual pagination
    state: {
      sorting,
      pagination: {
        pageIndex: pageIndex || 0,
        pageSize: data.length // This is just a placeholder since we control data externally
      }
    },
    meta: {
      onEdit: onEdit,
      onDelete: onDelete,
    } as CustomTableMeta<TData>,
  })

  return (
    <div className="space-y-4 text-text dark:text-darkText">
      <div className="rounded-none border-2 bg-secondaryBg dark:bg-secondaryBlack">
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
      <div className="flex items-center justify-end space-x-2">
        <div className="flex items-center gap-2 text-sm font-medium pr-4">
          Page
          <Input
            className="h-8 w-12 p-0 text-center"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            onBlur={() => {
              const page = Number(pageInput) - 1
              if (page >= 0 && page < table.getPageCount()) {
                onPageChange?.(page)
              } else {
                setPageInput(((pageIndex || 0) + 1).toString())
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const page = Number(pageInput) - 1
                if (page >= 0 && page < table.getPageCount()) {
                  onPageChange?.(page)
                } else {
                  setPageInput(((pageIndex || 0) + 1).toString())
                }
              }
            }}
          />
          of {table.getPageCount()}
        </div>
        <Button
          variant="neutral"
          size="sm"
          onClick={() => onPageChange?.((pageIndex || 0) - 1)}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="neutral"
          size="sm"
          onClick={() => onPageChange?.((pageIndex || 0) + 1)}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
