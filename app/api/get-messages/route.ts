import { db } from '@/lib/db'
import { messages } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { chatId }: { chatId: number } = await request.json()
  const _messages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))

  return NextResponse.json(_messages)
}
