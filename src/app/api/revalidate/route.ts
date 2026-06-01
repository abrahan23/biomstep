import { revalidatePath, revalidateTag } from "next/cache"
import { env } from "@/env"

export async function GET() {
  if (env.NODE_ENV !== "development") {
    return Response.json({ message: "Not allowed" }, { status: 403 })
  }

  revalidatePath("/")
  revalidateTag("categories")
  revalidateTag("subcategories")
  revalidateTag("catalog-nav")

  return new Response("revalidated everything", { status: 200 })
}
