import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { FileQuestion, Loader2 } from 'lucide-react'

interface Props {
  messages: Message[]
  isLoading: boolean
}

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading)
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )

  if (!messages)
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <FileQuestion className="w-6 h-6" />
      </div>
    )

  return (
    <div className="flex flex-col gap-2 py-2 px-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn('flex', {
            'justify-end pl-10': msg.role === 'user',
            'justify-start pr-10': msg.role === 'assistant',
          })}
        >
          <div
            className={cn(
              'rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10',
              {
                'bg-blue-600 text-white': msg.role === 'user',
              }
            )}
          >
            <p>{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessageList
