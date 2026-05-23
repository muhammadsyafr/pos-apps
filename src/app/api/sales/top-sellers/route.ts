import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "all"

    const now = new Date()
    let dateFilter = {}

    if (period === "today") {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0))
      dateFilter = { createdAt: { gte: startOfDay } }
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { gte: weekAgo } }
    } else if (period === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      dateFilter = { createdAt: { gte: monthAgo } }
    }

    const sales = await db.sale.findMany({
      where: dateFilter,
      include: {
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    })

    const productQuantities = new Map<string, number>()
    
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const current = productQuantities.get(item.productId) || 0
        productQuantities.set(item.productId, current + item.quantity)
      })
    })

    const sortedProducts = Array.from(productQuantities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)

    const productIds = sortedProducts.map(([id]) => id)
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    })

    const productMap = new Map(products.map((p) => [p.id, p.name]))

    const result = sortedProducts.map(([productId, totalSold]) => ({
      productId,
      name: productMap.get(productId) || "Unknown",
      totalSold,
    }))

    const maxSold = result[0]?.totalSold || 1

    return NextResponse.json(
      result.map((item) => ({
        ...item,
        percentage: Math.round((item.totalSold / maxSold) * 100),
      }))
    )
  } catch (error) {
    console.error("Failed to fetch top sellers:", error)
    return NextResponse.json({ error: "Failed to fetch top sellers" }, { status: 500 })
  }
}
