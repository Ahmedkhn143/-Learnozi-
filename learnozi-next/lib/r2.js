import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 Client configured for Cloudflare R2
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'learnozi-bucket';

/**
 * Upload a file buffer or stream to Cloudflare R2 bucket
 * @param {Buffer} fileBuffer - File binary data
 * @param {string} fileName - File name to save as in bucket
 * @param {string} mimeType - File MIME type (e.g. application/pdf)
 * @returns {Promise<string>} Public or presigned URL of the uploaded file
 */
export async function uploadToR2(fileBuffer, fileName, mimeType) {
  const key = `uploads/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await r2Client.send(command);

  // Return public URL (or custom domain if configured)
  const publicDomain = process.env.R2_PUBLIC_URL || `https://${accountId}.r2.cloudflarestorage.com/${BUCKET_NAME}`;
  return `${publicDomain}/${key}`;
}

/**
 * Delete a file from Cloudflare R2 bucket
 * @param {string} fileKey - Key of the file in R2
 */
export async function deleteFromR2(fileKey) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: fileKey,
  });

  await r2Client.send(command);
}
