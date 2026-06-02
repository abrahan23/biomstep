"use client"

import { useTranslations } from "next-intl"
import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import type { StripePaymentStatus } from "@/types"

import { Link } from "@/i18n/routing"
import { getStripePaymentStatusColor } from "@/lib/checkout"
import { cn, formatDate, formatId, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type AccountOrderRow = {
  id: string
  amount: string
  quantity: number | null
  status: string
  createdAt: Date
  invoiceUrl: string | null
}

interface AccountOrdersTableProps {
  orders: AccountOrderRow[]
}

export function AccountOrdersTable({ orders }: AccountOrdersTableProps) {
  const t = useTranslations("Account")

  function getStatusLabel(status: string) {
    const key = `status.${status}` as `status.${StripePaymentStatus}`
    return t.has(key) ? t(key) : status
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("tableOrderId")}</TableHead>
            <TableHead>{t("tableDate")}</TableHead>
            <TableHead>{t("tableStatus")}</TableHead>
            <TableHead className="text-right">{t("tableItems")}</TableHead>
            <TableHead className="text-right">{t("tableAmount")}</TableHead>
            <TableHead className="w-[70px]">
              <span className="sr-only">{t("tableActions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const status = order.status as StripePaymentStatus

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-medium hover:underline"
                  >
                    {formatId(order.id)}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "pointer-events-none text-sm text-white",
                      getStripePaymentStatusColor({ status, shade: 600 })
                    )}
                  >
                    {getStatusLabel(status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {order.quantity ?? 0}
                </TableCell>
                <TableCell className="text-right">
                  {formatPrice(order.amount)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        aria-label={t("openMenu")}
                        variant="ghost"
                        className="flex size-8 p-0 data-[state=open]:bg-muted"
                      >
                        <DotsHorizontalIcon
                          className="size-4"
                          aria-hidden="true"
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[180px]">
                      <DropdownMenuItem asChild>
                        <Link href={`/account/orders/${order.id}`}>
                          {t("viewOrder")}
                        </Link>
                      </DropdownMenuItem>
                      {order.invoiceUrl ? (
                        <DropdownMenuItem asChild>
                          <Link
                            href={order.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {t("viewInvoice")}
                          </Link>
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
