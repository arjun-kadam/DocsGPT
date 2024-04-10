import { auth } from '@clerk/nextjs'
import { db } from './db'
import { chats } from './db/schema'
import { eq, asc } from 'drizzle-orm'

export async function getFirstChat() {
  const { userId } = auth()
  if (userId) {
    const [firstChat] = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(asc(chats.id))
      .limit(1)

    return firstChat
  }
  return null
}
