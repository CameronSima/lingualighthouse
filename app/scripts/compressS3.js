const {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");

const zlib = require("zlib");
const util = require("util");

const compress = util.promisify(zlib.brotliCompress);

const BUCKET_NAME = "yt-search-transcript-segments";

let S3_AWS_ACCESS_KEY_ID = "AKIA37FKCQJKJ4KLUSXV";
let S3_AWS_SECRET_ACCESS_KEY = "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";

const client = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: S3_AWS_ACCESS_KEY_ID,
    secretAccessKey: S3_AWS_SECRET_ACCESS_KEY,
  },
});

const command = new ListObjectsV2Command({
  Bucket: BUCKET_NAME,
});

async function main() {
  try {
    let count = 0;
    let isTruncated = true;

    console.log("Your bucket contains the following objects:\n");

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await client.send(command);

      for (const c of Contents) {
        const command = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: c.Key,
        });
        const result = await client.send(command);
        const body = await result.Body.transformToByteArray();

        const compressed = await compress(body);

        const putCommand = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: c.Key,
          Body: compressed,
        });
        await client.send(putCommand);
        count++;
        console.log({ count });
      }

      isTruncated = IsTruncated;
      console.log(isTruncated);
      command.input.ContinuationToken = NextContinuationToken;
    }
  } catch (err) {
    console.error(err);
  }
}

//main();

// async function main() {
//   let num = 0;

//   const { Contents, IsTruncated, NextContinuationToken } = await client.send(
//     new ListObjectsV2Command({
//       Bucket: BUCKET_NAME,
//       MaxKeys: 1,
//     })
//   );

//   for (const c of Contents) {
//     const command = new GetObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: c.Key,
//     });
//     const result = await client.send(command);
//     const body = await result.Body.transformToByteArray();
//     const compressed = await compress(body);
//     const putCommand = new PutObjectCommand({
//       Bucket: BUCKET_NAME,
//       Key: c.Key,
//       Body: compressed,
//     });
//     await client.send(putCommand);
//   }
// }
main();
