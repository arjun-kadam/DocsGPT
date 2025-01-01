import { auth } from "@clerk/nextjs/server";
import { db } from './db'
import { chats } from './db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getFirstChat() {
  const authResult = await auth()
  if (authResult.userId) {
    const [firstChat] = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, authResult.userId))
      .orderBy(asc(chats.id))
      .limit(1)

    return firstChat
  }
  return null
}