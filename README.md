# DocsGPT - Chat With Docs Using LLM

## Project Group Members
- Arjun Kadam
- Simran Pathan
- Vaibhav Pandarkar
- Vaishnavi Raykar

## Mentor 
- Prof. Swati Bhosale

## Tech Stack

A DocsGPT using:

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

