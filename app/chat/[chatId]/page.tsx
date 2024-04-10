import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import ChatSidebar from './ChatSidebar'
import PDFViewer from './PDFViewer'
import ChatComponent from './ChatComponent'
import { checkProSubscription } from '@/lib/subscription'

interface Props {
  params: {
    chatId: string
  }
}

const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth()
  if (!userId) return redirect('/sign-in')

  const isPro = await checkProSubscription()

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId))
  if (!_chats) return redirect('/')
  if (!_chats.find((chat) => chat.id === parseInt(chatId))) return redirect('/')

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId))

  return (
    <div className="flex max-h-screen overflow-scroll">
      <div className="flex w-full max-h-screen overflow-scroll">
        <div className="flex-[1] max-w-xs">
          <ChatSidebar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>

        <div className="max-h-screen overflow-scroll flex-[5]">
          <PDFViewer pdfUrl={currentChat?.pdfUrl || ''} />
        </div>

        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage
