import { storeConfig } from "@/config/store"
import {
  revalidateItems,
  seedCategories,
  seedProducts,
  seedStore,
  seedSubcategories,
} from "@/lib/actions/seed"

async function runSeed() {
  console.log("⏳ Running seed...")

  const start = Date.now()

  await seedStore()

  await seedCategories()

  await seedSubcategories()

  await seedProducts({ storeId: storeConfig.id, count: 30 })

  await revalidateItems()

  const end = Date.now()

  console.log(`✅ Seed completed in ${end - start}ms`)

  process.exit(0)
}

runSeed().catch((err) => {
  console.error("❌ Seed failed")
  console.error(err)
  process.exit(1)
})
