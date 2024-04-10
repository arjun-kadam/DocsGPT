import { db } from '@/lib/db'
import { userSubscriptions } from '@/lib/db/schema'
import { stripe } from '@/lib/stripe'
import { auth, currentUser } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

const return_url = process.env.NEXT_PUBLIC_URL + '/'

export async function GET() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const _userSubscriptions = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))

    // trying to cancel at the billing portal
    if (_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscriptions[0].stripeCustomerId,
        return_url,
      })
      return NextResponse.json({ url: stripeSession.url })
    }

    // user's first time strying to subscribe
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: return_url,
      cancel_url: return_url,
      payment_method_types: ['card'],
      mode: 'subscription',
      billing_address_collection: 'auto',
      customer_email: user?.emailAddresses[0].emailAddress,
      line_items: [
        {
          price_data: {
            currency: 'INR',
            product_data: {
              name: 'DocsGPT Pro',
              description: 'Unlimited PDF uploads!',
            },
            unit_amount: 199,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (error) {
    console.log('stripe error', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
