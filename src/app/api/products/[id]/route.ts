import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, sku, costPrice, sellPrice, stock, minStock, category, imageUrl } = body

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        sku,
        costPrice: parseFloat(costPrice),
        sellPrice: parseFloat(sellPrice),
        stock: parseInt(stock),
        minStock: parseInt(minStock) || 5,
        category,
        imageUrl,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}