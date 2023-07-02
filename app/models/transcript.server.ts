import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type Transcript = {
  id: ReturnType<typeof createId>;
  videoId: string;
  segments: string;
};

type TranscriptItem = {
  pk: string;
  sk: `Transcript#${Transcript["id"]}`;
};

const skToId = (sk: TranscriptItem["sk"]): Transcript["id"] =>
  sk.replace(/^Transcript#/, "");
const idToSk = (id: Transcript["id"]): TranscriptItem["sk"] =>
  `Transcript#${id}`;

export async function getTranscriptByVideoId(
  videoId: string
): Promise<Transcript | null> {
  const db = await arc.tables();
  const result = await db.transcript.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": videoId },
  });
  const [record] = result.Items;
  if (record) {
    return {
      id: skToId(record.sk),
      videoId: record.pk,
      segments: record.segments,
    };
  }
  return null;
}

export async function getTranscript({
  id,
  videoId,
}: Pick<Transcript, "id" | "videoId">): Promise<Transcript | null> {
  const db = await arc.tables();

  const result = await db.transcript.get({ pk: videoId, sk: idToSk(id) });

  if (result) {
    return {
      videoId: result.pk,
      id: result.sk,
      segments: result.segments,
    };
  }
  return null;
}

export async function getTranscriptListItems({
  videoId,
}: Pick<Transcript, "videoId">): Promise<Array<Transcript>> {
  const db = await arc.tables();

  const result = await db.Transcript.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": videoId },
  });

  return result.Items.map((n: any) => ({
    id: skToId(n.sk),
    videoId: n.pk,
    segments: n.segments,
  }));
}

export async function createTranscript({
  segments,
  videoId,
}: Pick<Transcript, "segments" | "videoId">): Promise<Transcript> {
  const db = await arc.tables();

  const result = await db.transcript.put({
    pk: videoId,
    sk: idToSk(createId()),
    segments: segments,
  });
  return {
    id: skToId(result.sk),
    videoId: result.pk,
    segments: result.segments,
  };
}

// create many
export async function createTranscripts(
  transcripts: Array<Pick<Transcript, "segments" | "videoId">>
) {
  const db = await arc.tables();

  // chunk in batches of 25
  const chunks: Array<Array<Pick<Transcript, "segments" | "videoId">>> =
    transcripts.reduce<Array<Array<Pick<Transcript, "segments" | "videoId">>>>(
      (acc, curr) => {
        const last = acc[acc.length - 1];
        if (last.length === 25) {
          acc.push([curr]);
        } else {
          last.push(curr);
        }
        return acc;
      },
      [[]]
    );

  for (const chunk of chunks) {
    await Promise.all(chunk.map((transcript) => createTranscript(transcript)));
  }
}

export async function deleteTranscript({
  id,
  videoId,
}: Pick<Transcript, "id" | "videoId">) {
  const db = await arc.tables();
  return db.Transcript.delete({ pk: videoId, sk: idToSk(id) });
}
