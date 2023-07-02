import { TranscriptResponse, YoutubeTranscript } from "youtube-transcript";

export interface SearchResult {
  matches: [];
  numResults: number;
  searchText: string;
  video: {
    id: string;
    url: string;
    publishedAt: Date;
    title: string;
    description: string;
  };
}

export interface TextSegment {
  id: string;
  iStart: number;
  iEnd: number;
  text: string;
  originalText: string;
  start: number;
  duration: number;
  textPreceding: string[];
  textFollowing: string[];
}

export interface TextMatch {
  id: string;
  precedingText: string;
  exactText: string;
  followingText: string;
  startSeconds: number;
  endSeconds: number;
  startSecondsFormatted: string;
}

export async function getTranscript(
  videoId: string
): Promise<TranscriptResponse[]> {
  const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
    lang: "en",
  });
  return transcript;
}

export function processTranscript(
  rawSegments: TranscriptResponse[],
  numBookends = 1
) {
  const segments: TextSegment[] = [];
  let fullText = "";
  let charIndex = 0;

  rawSegments.forEach((segment, index) => {
    let textPreceding: string[] = [];
    let textFollowing: string[] = [];
    // add space to preserve word boundaries
    const text = segment.text + " ";
    const textLower = text.toLowerCase();
    const iEnd = charIndex + text.length;

    // add some text on either end of the matching text for context
    if (index >= numBookends) {
      const preceding = rawSegments.slice(index - numBookends, index);
      textPreceding = preceding.map((s) => s.text);
    }

    if (index < rawSegments.length - numBookends) {
      const following = rawSegments.slice(index + 1, index + numBookends + 1);
      textFollowing = following.map((s) => s.text);
    }

    segments.push({
      id: index.toString(),
      text: textLower,
      originalText: text,
      duration: segment.duration / 1000,
      start: segment.offset / 1000,
      iStart: charIndex,
      iEnd,
      textPreceding,
      textFollowing,
    });

    fullText += textLower;
    charIndex = iEnd;
  });

  return { segments, fullText };
}

export function searchTranscript(
  fullText: string,
  textSegments: TextSegment[],
  searchText: string
) {
  const matches: TextMatch[] = [];
  const indexes = getMatchedIndexes(fullText, searchText.toLowerCase());

  let id = 0;
  for (let [iStart, iEnd] of indexes) {
    id += 1;
    const matchingSegments = [];

    for (const segment of textSegments) {
      if (iStart === segment.iEnd) {
        iStart += 1;
      }

      if (
        (segment.iStart <= iStart && iStart <= segment.iEnd) ||
        (segment.iStart <= iEnd && iEnd <= segment.iEnd)
      ) {
        matchingSegments.push(segment);
      }
    }
    const match = buildMatch(id.toString(), searchText, matchingSegments);
    matches.push(match);
  }
  return matches;
}

function getMatchedIndexes(
  text: string,
  searchText: string
): [number, number][] {
  const regex = new RegExp(searchText, "g");
  const matches = [];

  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }

  return matches.map((m) => [m.index, m.index + m[0].length]);
}

function buildMatch(
  id: string,
  searchText: string,
  segments: TextSegment[]
): TextMatch {
  const firstSegment = segments[0];
  const lastSegment = segments[segments.length - 1];
  const precedingText = firstSegment.textPreceding.join("").trim();
  const followingText = lastSegment.textFollowing.join("").trim();
  const mainTextLower = segments
    .map((x) => x.text)
    .join("")
    .trim();
  const mainTextOriginal = segments
    .map((x) => x.originalText)
    .join("")
    .trim();
  const fullText = `${precedingText} ${mainTextLower} ${followingText}`;
  const fullTextOriginal = `${precedingText} ${mainTextOriginal} ${followingText}`;

  // find indexes of the search text in the full text, with lowercase matching
  const indexes = getMatchedIndexes(fullText, searchText.toLowerCase());

  // split the text into preceding, exact matching, and following from
  // the original text
  const preceding = fullTextOriginal.substring(0, indexes[0][0]);
  const exact = fullTextOriginal.substring(indexes[0][0], indexes[0][1]);
  const following = fullTextOriginal.substring(indexes[0][1]);

  return {
    id,
    precedingText: preceding.trim(),
    exactText: exact.trim(),
    followingText: following.trim(),

    // add 2 second buffer as lead-in
    startSeconds: Math.floor(firstSegment.start) - 2,
    endSeconds: Math.floor(lastSegment.start + lastSegment.duration),
    startSecondsFormatted: formatTime(firstSegment.start),
  };
}

function formatTime(time: number): string {
  const formatted: string = new Date(time * 1000).toISOString().substr(11, 8);
  // remove milliseconds
  return formatted.split(".")[0];
}
