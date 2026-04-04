import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const products = await db.product.findMany({
      orderBy: { name: "asc" },
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, sku, costPrice, sellPrice, stock, minStock, category, imageUrl } = body

    const product = await db.product.create({
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
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}