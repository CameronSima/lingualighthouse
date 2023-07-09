import { processTranscript } from "./transcript.server";
import snippets from "../mocks/videoSnippets.json";

test("processTranscript", () => {
  const { segments, fullText } = processTranscript(snippets);
  expect(segments[0]).toEqual({
    duration: 4.239,
    iEnd: 33,
    iStart: 0,
    id: "0",
    originalText: "my friends or perhaps tonight my ",
    start: 1.12,
    text: "my friends or perhaps tonight my ",
    textFollowing: ["comrades"],
    textPreceding: [],
  });
  expect(segments.length).toBe(2785);
  expect(fullText).toBeTypeOf("string");
});
