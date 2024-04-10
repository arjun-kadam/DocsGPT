import { config as awsConfig, S3 } from 'aws-sdk'

export async function uploadToS3(file: File) {
  awsConfig.update({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
  })

  const s3 = new S3({
    params: {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
    },
    region: process.env.NEXT_PUBLIC_S3_REGION,
  })

  const fileKey = `uploads/${Date.now()}-${file.name.replace(' ', '-')}`

  await s3
    .putObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      Body: file,
    })
    .promise()

  return fileKey
}
