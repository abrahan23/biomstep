import { syncCatalogFromSeed } from "@/lib/actions/seed"

async function run() {
  console.log("⏳ Syncing catalog from catalog seed into database...")
  await syncCatalogFromSeed()
  console.log("✅ Done")
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
