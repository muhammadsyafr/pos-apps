import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const categories = await db.category.findMany({
      include: { tags: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error("GET /api/categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const category = await db.category.create({
      data: {
        name: body.name,
        color: body.color || "#3B82F6",
      },
    })
    return NextResponse.json(category)
  } catch (error) {
    console.error("POST /api/categories:", error)
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 })
  }
}
