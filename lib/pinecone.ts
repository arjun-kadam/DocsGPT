import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone'
import { downloadFromS3 } from './s3-server'
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import {
  Document,
  RecursiveCharacterTextSplitter,
} from '@pinecone-database/doc-splitter'
import { getEmbeddings } from './embeddings'
import md5 from 'md5'

interface PDFPage {
  pageContent: string
  metadata: {
    source: string
    loc: { pageNumber: number }
  }
}

type IndexSignature = {
  [key: string]: any
}

export interface PineconeRecordMetadata {
  fileKey: string
  pageNumber: number
  text: string
}

const pinecone = new Pinecone({
  environment: process.env.PINECONE_ENVIRONMENT!,
  apiKey: process.env.PINECONE_API_KEY!,
})

async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain pdf
  console.log('Downloading S3 object to file system...')
  const localFile = await downloadFromS3(fileKey)

  if (!localFile) throw new Error('Cannot download from S3')
  const loader = new PDFLoader(localFile)
  const pages = (await loader.load()) as PDFPage[]

  // 2. split and segment the pdf into smaller documents
  const documents = await prepareDocuments(pages)

  // 3. vectorize and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument))
  const records = vectors.map((vector) => ({
    ...vector,
    metadata: { ...vector.metadata, fileKey },
  })) as PineconeRecord<PineconeRecordMetadata & IndexSignature>[]

  // 4. upload to pinecone
  await pinecone.index(process.env.PINECONE_INDEX_NAME!).upsert(records)
}

function truncateStringByBytes(str: string, bytes: number) {
  const enc = new TextEncoder()
  return new TextDecoder('utf-8').decode(enc.encode(str).slice(0, bytes))
}

async function prepareDocuments(pages: PDFPage[]) {
  const splitter = new RecursiveCharacterTextSplitter()
  return await splitter.splitDocuments(
    pages.map(
      ({ pageContent, metadata }) =>
        new Document({
          pageContent,
          metadata: {
            pageNumber: metadata.loc.pageNumber,
            text: truncateStringByBytes(pageContent, 36_000),
          },
        })
    )
  )
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent)
    const hash = md5(doc.pageContent)

    return {
      id: hash,
      values: embeddings,
      metadata: {
        pageNumber: doc.metadata.pageNumber as number,
        text: doc.metadata.text as string,
      },
    }
  } catch (error) {
    console.log('Error embedding documents', error)
    throw error
  }
}

export { loadS3IntoPinecone }
