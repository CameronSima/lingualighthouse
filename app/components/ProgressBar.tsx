import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";

export default function ProgressBar({
  selected,
  matches,
  duration,
  setSelected,
}: {
  selected: TextMatch;
  matches: TextMatch[];
  duration: number;
  setSelected: (match: TextMatch) => void;
}) {
  return (
    <div className="relative h-10">
      {matches.map((match) => {
        const isSelected = match.id === selected.id;

        return (
          <BreadCrumb
            key={match.id}
            onClick={() => setSelected(match)}
            isSelected={isSelected}
            position={Math.round((match.startSeconds / duration) * 100)}
            text={match.startSecondsFormatted}
          />
        );
      })}
      <Background />
      <Progress
        percentage={Math.round((selected.startSeconds / duration) * 100)}
      />
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

function BreadCrumb({
  position,
  text,
  isSelected,
  onClick,
}: {
  position: number;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}) {
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
      <Badge text={text} isSelected={isSelected} onClick={onClick} />
    </div>
  );
}

function Badge({
  text,
  isSelected,
  onClick,
}: {
  text: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const opactityClass = isSelected
    ? "opacity-100"
    : "hover:opacity-100 opacity-70";
  const zIndexClass = isSelected ? "z-10" : "hover:z-10 z-1";
  const borderClass = isSelected
    ? "border-2 border-blue-600"
    : "hover:border hover:border-blue-400";
  return (
    <span
      onClick={onClick}
      className={`${opactityClass} ${zIndexClass} ${borderClass} duration mr-2 cursor-pointer rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium transition hover:bg-blue-200 hover:shadow-lg`}
      style={{
        //border: isSelected ? "2px solid #2563EB" : "none",
        top: "-26px",
        position: "relative",
        left: "-37px",
      }}
    >
      {text}
    </span>
  );
}
