import { createClient } from '@supabase/supabase-js'
import { downloadFromS3 } from './s3-server'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Document, RecursiveCharacterTextSplitter } from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings'
import md5 from 'md5'

interface PDFPage {
  pageContent: string
  metadata: {
    source: string
    loc: { pageNumber: number }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

/**
 * Load a PDF file from S3, process it, and store its content in Supabase.
 * @param {string} fileKey - The key of the file in S3.
 */
async function loadS3IntoSupabase(fileKey: string) {
  try {
    
    console.log('Downloading S3 object to file system...')
    const localFile = await downloadFromS3(fileKey)

    if (!localFile) {
      throw new Error('Failed to download file from S3')
    }

    
    const loader = new PDFLoader(localFile)
    const pages = (await loader.load()) as PDFPage[]

    
    const documents = await prepareDocuments(pages)

    
    const vectors = await Promise.all(documents.flat().map(embedDocument))
    const records = vectors.map((vector) => ({
      ...vector,
      metadata: { ...vector.metadata, fileKey },
    }))

    
    const { data, error } = await supabase.from('vectors').upsert(records)

    if (error) throw error

    console.log('Data successfully uploaded to Supabase')
  } catch (error) {
    console.error('Error processing and uploading to Supabase:', error)
    throw error
  }
}

/**
 * Truncate a string to a specified number of bytes.
 * @param {string} str - The string to truncate.
 * @param {number} bytes - The maximum number of bytes.
 * @returns {string} - The truncated string.
 */
function truncateStringByBytes(str: string, bytes: number) {
  const encoder = new TextEncoder()
  return new TextDecoder('utf-8').decode(encoder.encode(str).slice(0, bytes))
}

/**
 * Prepare documents by splitting PDF pages into smaller chunks.
 * @param {PDFPage[]} pages - The pages of the PDF.
 * @returns {Promise<Document[]>} - The split documents.
 */
async function prepareDocuments(pages: PDFPage[]) {
  const splitter = new RecursiveCharacterTextSplitter()
  return await splitter.splitDocuments(
    pages.map(
      ({ pageContent, metadata }) =>
        new Document({
          pageContent,
          metadata: {
            pageNumber: metadata.loc.pageNumber,
            text: truncateStringByBytes(pageContent, 36_000), // Limit size for embedding
          },
        })
    )
  )
}

/**
 * Generate embeddings for a document and create a vector.
 * @param {Document} doc - The document to process.
 * @returns {Promise<any>} - The vector with embeddings and metadata.
 */
async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent)
    const hash = md5(doc.pageContent)

    return {
      id: hash,
      vector: embeddings,
      metadata: {
        pageNumber: doc.metadata.pageNumber as number,
        text: doc.metadata.text as string,
      },
    }
  } catch (error) {
    console.error('Error embedding document:', error)
    throw error
  }
}

export { loadS3IntoSupabase }
