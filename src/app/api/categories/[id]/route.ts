import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const category = await db.category.update({
    where: { id },
    data: {
      name: body.name,
      color: body.color,
    },
  })
  return NextResponse.json(category)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
