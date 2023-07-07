import { memo, useContext, useMemo } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import { TextMatch } from "~/transcript.server";
import { Video } from "~/youtube.server";

export default function ProgressBar({
  matches,
  selected,
  progressTime,
  setSelected,
}: {
  matches: TextMatch[];
  selected: TextMatch;
  progressTime: number;
  setSelected: (match: TextMatch) => void;
}) {
  const { duration } = useContext(VideoContext);
  const progressPercentage = useMemo(
    () => Math.round((progressTime / duration) * 100),
    [progressTime, duration]
  );
  return (
    <div className="relative h-10">
      {matches.map((match) => {
        const isSelected = match.id === selected.id;

        const breadcrumbPosition = useMemo(
          () => Math.round((match.startSeconds / duration) * 100),
          [match.startSeconds, duration]
        );

        const breadcrumbClick = useMemo(() => {
          return () => setSelected(match);
        }, [match, setSelected]);

        return (
          <BreadCrumb
            key={match.id}
            onClick={breadcrumbClick}
            isSelected={isSelected}
            position={breadcrumbPosition}
            text={match.startSecondsFormatted}
          />
        );
      })}
      <Background />
      <Progress percentage={progressPercentage} />
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

const Background = memo(() => {
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
});

const BreadCrumb = memo(
  ({
    position,
    text,
    isSelected,
    onClick,
  }: {
    position: number;
    text: string;
    isSelected: boolean;
    onClick: () => void;
  }) => {
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
);

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
