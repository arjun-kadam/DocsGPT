'use client'

import { Button } from '@/components/ui/button'
import { useState } from 'react'

const SubscriptionButton = ({ isPro }: { isPro: boolean }) => {
  const { isLoading, handleSubscription } = useSubscriptionHandler()

  return (
    <Button disabled={isLoading} onClick={handleSubscription}>
      {isPro ? 'Manage Subscriptions' : 'Get Pro'}
    </Button>
  )
}

function useSubscriptionHandler() {
  const [isLoading, setIsLoading] = useState(false)
  const handleSubscription = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(process.env.NEXT_PUBLIC_URL + '/api/stripe')
      const { url } = await res.json()
      window.location.href = url
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return { isLoading, handleSubscription }
}

export default SubscriptionButton
