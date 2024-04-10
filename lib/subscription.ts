import { auth } from '@clerk/nextjs'
import { db } from './db'
import { userSubscriptions } from './db/schema'
import { eq } from 'drizzle-orm'

export async function checkProSubscription() {
  const { userId } = await auth()

  if (!userId) return false

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId))

  if (!_userSubscriptions[0]) return false

  const userSubscription = _userSubscriptions[0]
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime()! > Date.now()

  return !!isValid
}
