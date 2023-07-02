import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { TranscriptResponse } from "youtube-transcript";

const BUCKET_NAME = "yt-search-transcript-segments";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
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
    Body: file,
  });
  return s3.send(command);
}

export async function getFile(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  const result = await s3.send(command);
  const body = await result.Body!.transformToString();
  return JSON.parse(body);
}

export async function getFiles(keys: string[]) {
  return Promise.all(keys.map((key) => getFile(key)));
}

export function getVideoS3Key(videoId: string) {
  return `video-${videoId}`;
}
