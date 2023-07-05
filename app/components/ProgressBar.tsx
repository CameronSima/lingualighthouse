import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";

export default function ProgressBar({
  selected,
  video,
  matches,
  duration,
}: {
  selected: TextMatch;
  video: Video;
  matches: TextMatch[];
  duration: number;
}) {
  const percentage = Math.round((selected.startSeconds / duration) * 100);
  return (
    <div className="relative h-10">
      {matches.map((match) => {
        const percentage = Math.round((match.startSeconds / duration) * 100);

        return (
          <BreadCrumb
            key={match.id}
            position={percentage}
            text={match.startSecondsFormatted}
          />
        );
      })}
      <Background />
      <Progress percentage={percentage} />
    </div>
  );
}

function Progress({ percentage }: { percentage: number }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: `${percentage}%`,
        height: "100%",
        backgroundColor: "#868E96",
        zIndex: 2,
      }}
    />
  );
}

function Background() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#CED4DA",
      }}
    />
  );
}

function BreadCrumb({ position, text }: { position: number; text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: `${position}%`,
        height: "100%",
        width: 30,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className="absolute z-10 h-full w-0.5 bg-black" />
      <Badge text={text} />
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium"
      style={{
        opacity: 0.75,
        top: "-26px",
        position: "relative",
        left: "-30px",
      }}
    >
      {text}
    </span>
  );
}
