import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function getEmbeddings(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text.replace(/\n/g, ' '));
    const embedding = await result.embedding;
    return embedding.values;
  } catch (error) {
    console.log('Error calling Gemini Embeddings API', error);
    throw error;
  }
}