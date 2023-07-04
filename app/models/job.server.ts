import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type JobStatus =
  | "pending"
  | "searching"
  | "processing"
  | "completed"
  | "failed";

export type Job = {
  id: string;
  channelId: string;
  status: JobStatus;
};

const skToId = (sk: string): string => sk.replace(/^Job#/, "");
//const idToSk = (id: string): string => `Job#${id}`;

export const createJob = async (channelId: string): Promise<void> => {
  const db = await arc.tables();
  await db.job.put({
    pk: channelId,
    id: createId(),
    status: "pending",
  });
};

export const getJobByChannelId = async (
  channelId: string
): Promise<Job | undefined> => {
  const db = await arc.tables();
  const result = await db.job.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": channelId },
  });
  const [record] = result.Items;
  if (record) {
    return {
      id: record.pk,
      channelId: record.channelId,
      status: record.status,
    };
  }
};

export const updateJobStatus = async (
  channelId: string,
  status: JobStatus
): Promise<void> => {
  const db = await arc.tables();
  await db.job.update({
    Key: { pk: channelId },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeNames: { "#status": "status" },
    ExpressionAttributeValues: { ":status": status },
  });
};
