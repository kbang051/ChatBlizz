import s3 from "./s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

export const uploadToS3 = async (fileBuffer, mimetype, extension) => {
    const key = `uploads/${uuidv4()}${extension}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
    });
    try {
        await s3.send(command);
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${key}`;
    } catch (error) {
        console.log("Error uploading file to S3:", error);
        throw error;
    }
}

