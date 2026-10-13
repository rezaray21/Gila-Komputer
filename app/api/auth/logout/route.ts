import { NextResponse } from 'next/server'
import { endSession } from '@/lib/auth'
import { forbiddenOrigin, sameOrigin } from '@/lib/api-guard'

export async function POST(request: Request) {
  if (!sameOrigin(request)) return forbiddenOrigin()
  await endSession()
  return NextResponse.json({ ok: true })
}
