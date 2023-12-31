import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { TranscriptResponse } from "youtube-transcript";
import { compressData, decompressData } from "./utils.server";

const BUCKET_NAME = "yt-search-transcript-segments";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function getTranscriptS3(
  videoId: string
): Promise<TranscriptResponse[]> {
  const key = getVideoS3Key(videoId);
  return getFile(key);
}

export async function uploadFile(file: Buffer, key: string) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: await compressData(file),
  });
  return s3.send(command);
}

export async function getFile(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  const result = await s3.send(command);
  const body = await result.Body!.transformToByteArray();
  const decompressed = await decompressData(Buffer.from(body));
  return JSON.parse(decompressed);
}

export async function getFiles(keys: string[]) {
  return Promise.all(keys.map((key) => getFile(key)));
}

export function getVideoS3Key(videoId: string) {
  return `video-${videoId}`;
}
