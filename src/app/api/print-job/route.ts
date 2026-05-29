import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// In-memory store: uuid → { bytes, expiresAt }
// Each job is one-time use and expires after 90 seconds.
const jobs = new Map<string, { data: Buffer; expiresAt: number }>()

function cleanup() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (job.expiresAt < now) jobs.delete(id)
  }
}

/** POST /api/print-job — store raw ESC/POS bytes, return { id } */
export async function POST(req: NextRequest) {
  cleanup()
  const body = await req.arrayBuffer()
  if (body.byteLength === 0) {
    return NextResponse.json({ error: "Empty body" }, { status: 400 })
  }
  // Accept a client-provided UUID so the client can trigger rawbt: before
  // awaiting this response, removing the user-visible wait.
  const clientId = req.headers.get("X-Job-Id") ?? ""
  const id = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId)
    ? clientId
    : crypto.randomUUID()
  jobs.set(id, {
    data: Buffer.from(body),
    expiresAt: Date.now() + 90_000,
  })
  return NextResponse.json({ id })
}

/** GET /api/print-job?id=<uuid> — serve raw ESC/POS bytes once then delete */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? ""
  if (!id) {
    return new NextResponse("Missing id", { status: 400 })
  }
  // Wait up to 4 s in 200 ms increments — handles the race where RawBT
  // fetches the URL before the browser POST has finished uploading.
  let job = jobs.get(id)
  if (!job) {
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 200))
      job = jobs.get(id)
      if (job) break
    }
  }
  if (!job || job.expiresAt < Date.now()) {
    jobs.delete(id)
    return new NextResponse("Not found or expired", { status: 404 })
  }
  jobs.delete(id)
  return new NextResponse(job.data.buffer.slice(job.data.byteOffset, job.data.byteOffset + job.data.byteLength) as ArrayBuffer, {
    headers: { "Content-Type": "application/octet-stream" },
  })
}
