import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const categories = await db.category.findMany({
    include: { tags: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(categories)
}

export async function POST(request: Request) {
  const body = await request.json()
  const category = await db.category.create({
    data: {
      name: body.name,
      color: body.color || "#3B82F6",
    },
  })
  return NextResponse.json(category)
}
