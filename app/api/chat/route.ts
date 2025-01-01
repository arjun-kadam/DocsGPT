import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from 'ai';
import { db } from '@/lib/db';
import { chats, messages as _messages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getContext } from '../../../lib/context';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const {
      messages,
      chatId,
    }: {
      messages: Message[];
      chatId: number;
    } = await request.json();

    const fileKey = await getFileKeyByChatId(chatId, () => {
      return NextResponse.json({ error: 'Chat not found' });
    });

    const lastMessage = messages[messages.length - 1];
    const context = await getContext(lastMessage.content, fileKey);

    // Initialize Gemini chat model
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Start chat with prepared history
    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }], // Adjusted to match the `Part[]` type
      })),
      generationConfig: {
        maxOutputTokens: 2048,
      },
    });

    // Prepare system prompt with context
    const systemPrompt = `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.`;

    // Send message and get response
    const result = await chat.sendMessageStream(systemPrompt + '\n\n' + lastMessage.content);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            controller.enqueue(encoder.encode(chunk.text())); // Process chunks from AsyncGenerator
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Store messages in the database
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: 'user',
    });

    const response = new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });

    // Handle full response after stream
    (async () => {
      let fullResponse = '';
      for await (const chunk of result.stream) {
        fullResponse += chunk.text(); // Accumulate full response
      }

      // Store the assistant's response
      await db.insert(_messages).values({
        chatId,
        content: fullResponse,
        role: 'system',
      });
    })();

    return response;
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Something went wrong...' },
      { status: 500 },
    );
  }
}

async function getFileKeyByChatId(chatId: number, onError: Function) {
  const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
  if (_chats.length !== 1) onError();
  return _chats[0].fileKey;
}
