import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { env } from "@/env.js"

import { getStore } from "@/lib/queries/store"
import { updateStore } from "@/lib/actions/store"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { LoadingButton } from "@/components/loading-button"

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Admin",
  description: "Manage your store, products, orders, and invoices",
}

export default async function AdminPage() {
  const store = await getStore()

  if (!store) {
    notFound()
  }

  return (
    <div className="space-y-10">
      <Card as="section">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Store details</CardTitle>
          <CardDescription>
            Update your store name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={updateStore.bind(null, store.id)}
            className="grid w-full max-w-xl gap-5"
          >
            <div className="grid gap-2.5">
              <Label htmlFor="update-store-name">Name</Label>
              <Input
                id="update-store-name"
                name="name"
                required
                minLength={3}
                maxLength={50}
                placeholder="Type store name here."
                defaultValue={store.name}
              />
            </div>
            <div className="grid gap-2.5">
              <Label htmlFor="update-store-description">Description</Label>
              <Textarea
                id="update-store-description"
                name="description"
                minLength={3}
                maxLength={255}
                placeholder="Type store description here."
                defaultValue={store.description ?? ""}
              />
            </div>
            <LoadingButton action="update" className="w-fit">
              Update store
              <span className="sr-only">Update store</span>
            </LoadingButton>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
