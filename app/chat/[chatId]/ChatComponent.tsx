'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useChat } from 'ai/react'
import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import MessageList from './MessageList'
import { Message } from 'ai'

async function getInitialMessages(chatId: number) {
  const data = await fetch(process.env.NEXT_PUBLIC_URL + '/api/get-messages', {
    method: 'POST',
    body: JSON.stringify({ chatId }),
    headers: { 'Content-Type': 'application/json' },
  })
  return (await data.json()) as Message[]
}

const ChatComponent = ({ chatId }: { chatId: number }) => {
  const messageContainer = useRef<HTMLDivElement>(null)
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getInitialMessages(chatId).then((messages) => {
      setInitialMessages(messages)
      setIsLoading(false)
    })
  }, [chatId])

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: '/api/chat',
    body: { chatId },
    initialMessages,
  })

  useEffect(() => {
    messageContainer.current?.scrollTo({
      top: messageContainer.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  return (
    <div className="relative h-screen overflow-scroll" ref={messageContainer}>
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit text-xl font-bold border-b">
        Chat
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 p-2 bg-white bg-gradient-to-t from-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ChatComponent
