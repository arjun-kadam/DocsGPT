# ChatPDF Clone

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Falexkuang0%2Fchatpdf&env=NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,CLERK_SECRET_KEY,DATABASE_URL,NEXT_PUBLIC_S3_ACCESS_KEY_ID,NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,NEXT_PUBLIC_S3_BUCKET_NAME,NEXT_PUBLIC_S3_REGION&envDescription=More%20environment%20variables%20examples&envLink=https%3A%2F%2Fgithub.com%2Falexkuang0%2Fchatpdf%2Fblob%2Fmain%2F.env.example&project-name=chatpdf-clone&repository-name=chatpdf-clone)

A ChatPDF clone using:

- Next.js 13 (App Router) in TypeScript
- Database
  - Drizzle ORM
  - Neon (Serverless PostgreSQL)
- AI-related
  - Pinecone (Vector Database)
  - Langchain
  - OpenAI SDK
  - Vercel AI SDK
- API schema validation: Zod
- Object Storage: AWS JavaScript SDK v2
- Payment: Stripe SDK
- Styling: Tailwind CSS
- Third-Party UI Components
  - React Dropzone
  - React Hot Toast
  - shadcn-ui
  - Lucide icons

## Usage

1. Add a `.env` according to `.env.example`

```bash
mv .env.example .env
```

2. Install dependencies using pnpm

```bash
pnpm install

# start development server
pnpm run dev

# build for production
pnpm run build

# start production server
pnpm run start
```

## Acknowledgement

This repo is a walkthrough demo based Elliott Chong's video: https://www.youtube.com/watch?v=bZFedu-0emE

However, I made following changes:

- refreshed SDK versions and related code
- dropped usage of React Query due to error, used fetch API instead
- dropped usage of edge runtime for routes due to error running latest Pinecone SDK at edge
- reorganized some parts of the code
- added API schema validation with Zod
- and many more ...
