import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { Readable } from "stream";

const bucketName = process.env.STORAGE_BUCKET;

function createS3Client() {
  const region = process.env.STORAGE_REGION;

  if (!bucketName || !region || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) {
    throw new Error("Missing storage configuration");
  }

  return new S3Client({
    region,
    endpoint: process.env.STORAGE_ENDPOINT || undefined,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY,
    },
  });
}

function createStorageKey(clientId: string, prefix: string) {
  return `clients/${clientId}/${prefix}/${Date.now()}-${randomUUID()}`;
}

export async function uploadDocumentToStorage(params: {
  clientId: string;
  contentType: string;
  fileBuffer: Buffer;
  folder: "client-uploads" | "admin-returns";
}) {
  const s3 = createS3Client();
  const key = createStorageKey(params.clientId, params.folder);

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: params.fileBuffer,
      ContentType: params.contentType,
      ServerSideEncryption: process.env.STORAGE_KMS_KEY_ID ? "aws:kms" : undefined,
      SSEKMSKeyId: process.env.STORAGE_KMS_KEY_ID || undefined,
    }),
  );

  return key;
}

async function createDocumentResponse(
  storageKey: string,
  fileName: string,
  contentType: string,
  dispositionType: "attachment" | "inline",
) {
  const s3 = createS3Client();
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );

  const body = result.Body;

  if (!body) {
    throw new Error("File not found in storage");
  }

  if ("transformToWebStream" in body && typeof body.transformToWebStream === "function") {
    return new Response(body.transformToWebStream(), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${dispositionType}; filename="${fileName}"`,
      },
    });
  }

  const nodeStream = body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of nodeStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `${dispositionType}; filename="${fileName}"`,
    },
  });
}

export async function createDownloadResponse(storageKey: string, fileName: string, contentType: string) {
  return createDocumentResponse(storageKey, fileName, contentType, "attachment");
}

export async function createInlineViewResponse(storageKey: string, fileName: string, contentType: string) {
  return createDocumentResponse(storageKey, fileName, contentType, "inline");
}

export async function deleteDocumentFromStorage(storageKey: string) {
  const s3 = createS3Client();
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );
}
