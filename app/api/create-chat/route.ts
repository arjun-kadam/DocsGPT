import { NextRequest, NextResponse } from 'next/server'
import { loadS3IntoPinecone } from '@/lib/pinecone'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs'
import { z } from 'zod'

const postBodySchema = z.object({
  fileKey: z.string(),
})

function getS3Url(file_key: string) {
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${file_key}`
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const postBody = await request.json()
    const validation = postBodySchema.safeParse(postBody)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      )
    }

    const { fileKey } = postBody
    await loadS3IntoPinecone(fileKey)

    const returns = await db
      .insert(chats)
      .values({
        fileKey,
        pdfName: fileKey.replace('uploads/', ''),
        pdfUrl: getS3Url(fileKey),
        userId,
      })
      .returning({
        insertedId: chats.id,
      })

    return NextResponse.json({ error: false, chatId: returns[0].insertedId })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
