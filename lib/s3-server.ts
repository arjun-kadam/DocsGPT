import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const streamPipeline = promisify(pipeline);

export async function downloadFromS3(fileKey: string): Promise<string> {
  const s3Client = new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    },
  });

  const command = new GetObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: fileKey,
  });

  const obj = await s3Client.send(command);

  if (!obj.Body) {
    throw new Error(`Failed to fetch object from S3 with key: ${fileKey}`);
  }

  const localFile = `D:\\tmp\\${Date.now()}.pdf`;

  // Use the Node.js pipeline to handle the stream
  await streamPipeline(obj.Body as NodeJS.ReadableStream, fs.createWriteStream(localFile));

  return localFile;
}
