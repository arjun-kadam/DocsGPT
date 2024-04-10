import { config as awsConfig, S3 } from 'aws-sdk'
import fs from 'fs'

export async function downloadFromS3(fileKey: string) {
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

  const obj = await s3
    .getObject({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
    })
    .promise()

  const localFile = `/tmp/${Date.now()}.pdf`
  fs.writeFileSync(localFile, obj.Body as Buffer)

  return localFile
}
