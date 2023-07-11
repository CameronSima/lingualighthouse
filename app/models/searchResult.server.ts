import arc from "@architect/functions";
import { createId } from "@paralleldrive/cuid2";

export type SearchResult = {
  id: ReturnType<typeof createId>;
};
