import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = {}

    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom)
      if (dateTo) (where.createdAt as Record<string, unknown>).lte = new Date(dateTo + "T23:59:59")
    }

    if (search) {
      where.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ]
    }

    const [sales, total] = await Promise.all([
      db.sale.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { name: true } },
          items: { include: { product: { select: { name: true, costPrice: true } } } },
        },
      }),
      db.sale.count({ where }),
    ])

    return NextResponse.json({
      sales,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!session.user?.id) {
      return NextResponse.json({ error: "User session invalid" }, { status: 401 })
    }

    const body = await request.json()
    const { items, paymentMethod, cashPaid, changeGiven } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    const userId = session.user.id
    console.log("Creating sale for userId:", userId)
    
    const totalAmount = items.reduce((sum: number, item: { price: number; quantity: number }) => {
      return sum + item.price * item.quantity
    }, 0)

    const result = await db.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          userId,
          totalAmount,
          cashPaid: cashPaid || 0,
          changeGiven: changeGiven || 0,
          paymentMethod: paymentMethod || "CASH",
        },
      })

      for (const item of items) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          },
        })

        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      const adminUsers = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      })

      for (const admin of adminUsers) {
        await tx.notification.create({
          data: {
            type: "SALE",
            title: "New Sale Transaction",
            message: `Sale #${sale.id.slice(0, 8)} completed for ${formatIDR(totalAmount)} by ${session.user.name}`,
            relatedId: sale.id,
            userId: userId,
          },
        })
      }

      return sale
    })

    return NextResponse.json({ success: true, saleId: result.id })
  } catch (error) {
    console.error("Sale error:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}
