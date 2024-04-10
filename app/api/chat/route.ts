import { NextRequest, NextResponse } from 'next/server'
import { Configuration, OpenAIApi } from 'openai-edge'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getContext } from '@/lib/context'
import { messages as _messages } from '@/lib/db/schema'

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      chatId,
    }: {
      messages: Message[]
      chatId: number
    } = await request.json()

    const fileKey = await getFileKeyByChatId(chatId, () => {
      return NextResponse.json({ error: 'Chat not found' })
    })

    const lastMessage = messages[messages.length - 1]
    const context = await getContext(lastMessage.content, fileKey)

    const prompt = {
      role: 'system',
      content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.`,
    }

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        prompt as Message,
        ...messages.filter((msg) => msg.role === 'user'),
      ],
      stream: true,
    })

    const stream = OpenAIStream(response, {
      onStart: async () => {
        await db.insert(_messages).values({
          chatId,
          content: lastMessage.content,
          role: 'user',
        })
      },
      onCompletion: async (completion) => {
        await db.insert(_messages).values({
          chatId,
          content: completion,
          role: 'system',
        })
      },
    })
    return new StreamingTextResponse(stream)
  } catch (error) {
    return NextResponse.json(
      { error: 'Something is going wrong ...' },
      { status: 500 }
    )
  }
}

async function getFileKeyByChatId(chatId: number, onError: Function) {
  const _chats = await db.select().from(chats).where(eq(chats.id, chatId))
  if (_chats.length !== 1) onError()
  return _chats[0].fileKey
}
