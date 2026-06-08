import { revalidatePath, revalidateTag } from "next/cache"

export async function GET() {
  revalidatePath("/")
  revalidateTag("categories")
  revalidateTag("subcategories")
  revalidateTag("catalog-nav")
  revalidateTag("featured-products")
  revalidateTag("best-selling-products")

  return new Response("revalidated everything", { status: 200 })
}
