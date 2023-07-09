import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

import type { User } from "./user.server";

export type VideoId = string;
export type ChannelId = string;
export type SearchType = "video" | "channel";

export type Search = {
  id: ReturnType<typeof createId>;
  userId: User["id"];
  resourceId: VideoId | ChannelId;
  searchText: string;
  searchType: SearchType;
  createdAt: string;
};

type SearchItem = {
  pk: User["id"];
  sk: `search#${Search["id"]}`;
};

const skToId = (sk: SearchItem["sk"]): Search["id"] =>
  sk.replace(/^search#/, "");
const idToSk = (id: Search["id"]): SearchItem["sk"] => `search#${id}`;

export async function getSearch({
  id,
  userId,
}: Pick<Search, "id" | "userId">): Promise<Search | null> {
  const db = await arc.tables();

  const result = await db.search.get({ pk: userId, sk: idToSk(id) });

  if (result) {
    return {
      userId: result.pk,
      id: result.sk,
      resourceId: result.resourceId,
      searchText: result.searchText,
      searchType: result.searchType,
      createdAt: result.createdAt,
    };
  }
  return null;
}

export async function getSearchesForUser(
  userId: string
): Promise<Array<Search>> {
  const db = await arc.tables();

  const result = await db.search.query({
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: { ":pk": userId },
  });

  return result.Items.map((n: any) => ({
    searchText: n.searchText,
    searchType: n.searchType,
    id: skToId(n.sk),
    userId: n.pk,
    resourceId: n.resourceId,
    createdAt: n.createdAt,
  }));
}

export async function createSearch({
  searchText,
  resourceId,
  searchType,
  userId,
}: Pick<
  Search,
  "searchText" | "userId" | "resourceId" | "searchType"
>): Promise<Search> {
  const db = await arc.tables();

  const id = createId();

  const result = await db.search.put({
    pk: userId,
    sk: idToSk(id),
    resourceId,
    searchText,
    searchType,
    createdAt: new Date().toISOString(),
  });
  return {
    userId: result.pk,
    id: result.sk,
    resourceId: result.resourceId,
    searchText: result.searchText,
    searchType: result.searchType,
    createdAt: result.createdAt,
  };
}
