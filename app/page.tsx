import { Button } from '@/components/ui/button'
import { UserButton, auth } from '@clerk/nextjs'
import { ArrowRight, LogIn } from 'lucide-react'
import Link from 'next/link'
import FileUpload from './FileUpload'
import SubscriptionButton from './SubscriptionButton'
import { checkProSubscription } from '@/lib/subscription'
import { getFirstChat } from '@/lib/serverUtils'

export default async function Home() {
  const { userId } = await auth()
  const isAuth = !!userId
  const isPro = await checkProSubscription()
  const firstChat = await getFirstChat()

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with your PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          {isAuth && (
            <div className="flex mt-2">
              {firstChat && (
                <Link href={`/chat/${firstChat.id}`}>
                  <Button>
                    Go to Chats <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
              <div className="ml-3">
                <SubscriptionButton isPro={isPro} />
              </div>
            </div>
          )}

          <p className="max-w-xl mt-1 text-md text-slate-600">
            Join millions of students, researchers and professionals to
            instantly answer questions and understand research with AI.
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/auth/sign-in">
                <Button>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login to Get Started!
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
