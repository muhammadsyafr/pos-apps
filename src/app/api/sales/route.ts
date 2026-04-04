import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sales = await db.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        items: { include: { product: { select: { name: true, costPrice: true } } } },
      },
    })
    return NextResponse.json(sales)
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

      return sale
    })

    return NextResponse.json({ success: true, saleId: result.id })
  } catch (error) {
    console.error("Sale error:", error)
    return NextResponse.json({ error: "Failed to process sale" }, { status: 500 })
  }
}
