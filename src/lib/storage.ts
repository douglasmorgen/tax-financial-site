import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { sanitizeFileName } from "@/lib/security";

type StorageFolder = "client-uploads" | "admin-returns";
type ContentDisposition = "attachment" | "inline";

type StorageContext = {
  bucketName: string;
  client: S3Client;
};

function createStorageContext(): StorageContext {
  const bucketName = process.env.STORAGE_BUCKET;
  const region = process.env.STORAGE_REGION;
  const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
  const endpoint = process.env.STORAGE_ENDPOINT;

  if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing storage configuration");
  }

  return {
    bucketName,
    client: new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === "true",
      ...(endpoint ? { endpoint } : {}),
    }),
  };
}

function createStorageKey(clientId: string, folder: StorageFolder): string {
  return `clients/${clientId}/${folder}/${Date.now()}-${randomUUID()}`;
}

export async function uploadDocumentToStorage(params: {
  clientId: string;
  contentType: string;
  fileBuffer: Buffer;
  folder: StorageFolder;
}): Promise<string> {
  const { bucketName, client } = createStorageContext();
  const key = createStorageKey(params.clientId, params.folder);
  const kmsKeyId = process.env.STORAGE_KMS_KEY_ID;

  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: params.fileBuffer,
      ContentType: params.contentType,
      ...(kmsKeyId
        ? {
            ServerSideEncryption: "aws:kms",
            SSEKMSKeyId: kmsKeyId,
          }
        : {}),
    }),
  );

  return key;
}

async function createDocumentResponse(
  storageKey: string,
  fileName: string,
  contentType: string,
  dispositionType: ContentDisposition,
): Promise<Response> {
  const { bucketName, client } = createStorageContext();
  const result = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );
  const body = result.Body;

  if (!body) {
    throw new Error("File not found in storage");
  }

  const responseFileName = sanitizeFileName(fileName) || "document";
  const headers = {
    "Content-Type": contentType,
    "Content-Disposition": `${dispositionType}; filename="${responseFileName}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  if ("transformToWebStream" in body && typeof body.transformToWebStream === "function") {
    return new Response(body.transformToWebStream(), { headers });
  }

  if (!(body instanceof Readable)) {
    throw new Error("Unsupported storage response body");
  }

  const chunks: Buffer[] = [];

  for await (const chunk of body) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return new Response(Buffer.concat(chunks), { headers });
}

export function createDownloadResponse(
  storageKey: string,
  fileName: string,
  contentType: string,
): Promise<Response> {
  return createDocumentResponse(storageKey, fileName, contentType, "attachment");
}

export function createInlineViewResponse(
  storageKey: string,
  fileName: string,
  contentType: string,
): Promise<Response> {
  return createDocumentResponse(storageKey, fileName, contentType, "inline");
}

export async function deleteDocumentFromStorage(storageKey: string): Promise<void> {
  const { bucketName, client } = createStorageContext();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: storageKey,
    }),
  );
}
