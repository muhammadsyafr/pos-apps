import { db } from "./db"

export async function warmupDatabase() {
  try {
    await db.$queryRaw`SELECT 1`
    console.log("[instrumentation] Database connection warmed up")
  } catch (error) {
    console.error("[instrumentation] Failed to warm up database:", error)
  } finally {
    await db.$disconnect()
  }
}

if (process.env.NEXT_PHASE !== "phase-production-build") {
  warmupDatabase()
}
