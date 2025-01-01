import { createClient } from '@supabase/supabase-js'
import { getEmbeddings } from './embeddings'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);

  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches
    .filter((match) => match.score > parseFloat(process.env.PINECONE_MATCH_SCORE_THRESHOLD!))
    .map((match) => match.metadata?.text);

  return qualifyingDocs.join('\n').substring(0, 3000);
}

async function getMatchesFromEmbeddings(embeddings: number[], fileKey: string) {
  try {

    const { data, error } = await supabase
      .from('vectors')
      .select('id, vector, metadata, fileKey')
      .filter('fileKey', 'eq', fileKey)
      .limit(5)

    if (error) throw error

    
    const threshold = parseFloat(process.env.PINECONE_MATCH_SCORE_THRESHOLD!)

    const matches = data.map((match) => {
      const distance = calculateEuclideanDistance(embeddings, match.vector)
      const score = 1 / (1 + distance) 
      return { ...match, score }
    })

    // Filter matches based on score threshold
    const qualifyingDocs = matches
      .filter((match) => match.score > threshold)
      .map((match) => match.metadata?.text)

    return qualifyingDocs || []
  } catch (error) {
    console.log('Error querying from embeddings')
    console.log((error as TypeError).stack)
    throw error

  }
}

function calculateEuclideanDistance(vector1: number[], vector2: number[]) {
  let sum = 0
  for (let i = 0; i < vector1.length; i++) {
    sum += Math.pow(vector1[i] - vector2[i], 2)
  }
  return Math.sqrt(sum)
}
