import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  const tags = await db.tag.findMany({
    include: { category: true, products: true },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(tags)
}

export async function POST(request: Request) {
  const body = await request.json()
  const tag = await db.tag.create({
    data: {
      name: body.name,
      categoryId: body.categoryId || null,
    },
  })
  return NextResponse.json(tag)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const tag = await db.tag.update({
    where: { id: body.id },
    data: {
      name: body.name,
      categoryId: body.categoryId || null,
    },
  })
  return NextResponse.json(tag)
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })
  
  await db.tag.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
