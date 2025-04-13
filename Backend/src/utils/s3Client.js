import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_AWS,
        secretAccessKey: process.env.SECRET_KEY_AWS
    }
})

export default s3;