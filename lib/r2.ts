/**
 * Client Cloudflare R2 (compatible S3) — remplace Supabase Storage.
 * Variables d'env requises (serveur uniquement) :
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export const R2_BUCKET = process.env.R2_BUCKET_NAME || "scan-results"

/** URL pré-signée valable `expiresIn` secondes (défaut 1 h) */
export async function getR2SignedUrl(key: string, expiresIn = 3600): Promise<string> {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }), { expiresIn })
}

/** Télécharge un objet R2 et le retourne en Blob */
export async function downloadFromR2(key: string): Promise<Blob> {
  const { Body } = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }))
  if (!Body) throw new Error("Corps R2 vide")
  const chunks: Uint8Array[] = []
  for await (const chunk of Body as AsyncIterable<Uint8Array>) chunks.push(chunk)
  return new Blob(chunks)
}
