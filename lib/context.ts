import { Pinecone } from '@pinecone-database/pinecone'
import { getEmbeddings } from './embeddings'

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query)

  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey)

  const qualifyingDocs = matches
    .filter((match) => {
      if (match.score)
        return (
          match.score > parseFloat(process.env.PINECONE_MATCH_SCORE_THRESHOLD!)
        )
    })
    .map((match) => match.metadata?.text)

  return qualifyingDocs.join('\n').substring(0, 3000)
}

async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
  try {
    const pinecone = new Pinecone({
      environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    })

    const { matches } = await pinecone
      .index(process.env.PINECONE_INDEX_NAME!)
      .query({
        topK: 5,
        includeMetadata: true,
        vector: embeddings,
        filter: { fileKey },
      })

    return matches || []
  } catch (error) {
    console.log('Error querying from embeddings')
    console.log((error as TypeError).stack)
    throw error
  }
}
