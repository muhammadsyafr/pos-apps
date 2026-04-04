import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    let settings = await db.printerSettings.findUnique({
      where: { id: "default" }
    })

    if (!settings) {
      settings = await db.printerSettings.create({
        data: { id: "default" }
      })
    }

    return NextResponse.json(settings, { 
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    })
  } catch (error) {
    console.error("Failed to get printer settings:", error)
    return NextResponse.json({ error: "Failed to get settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    const settings = await db.printerSettings.upsert({
      where: { id: "default" },
      update: body,
      create: {
        id: "default",
        ...body
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Failed to update printer settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
