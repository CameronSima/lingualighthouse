import { processTranscript, searchTranscript } from "./transcript.server";
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

test("searchTranscript", () => {
  const { segments, fullText } = processTranscript(snippets);
  const matches = searchTranscript(fullText, segments, "my friends");
  expect(matches.length).toBe(3);
  expect(matches[0]).toEqual({
    id: "1",
    precedingText: "",
    exactText: "my friends",
    followingText: "or perhaps tonight my comrades",
    startSeconds: -1,
    endSeconds: 5,
    startSecondsFormatted: "00:00:01",
  });
});
