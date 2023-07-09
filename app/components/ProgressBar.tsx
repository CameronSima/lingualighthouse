import { memo, useContext, useMemo } from "react";
import { VideoContext, VideoDispatchContext } from "~/context/videoContext";
import { VideoActions } from "~/reducers/video.reducer";
import { TextMatch } from "~/transcript.server";

export default function ProgressBar({
  progressTime,
}: {
  progressTime: number;
}) {
  const { duration, matches, selected } = useContext(VideoContext);
  const dispatch = useContext(VideoDispatchContext);

  const progressPercentage = useMemo(
    () => Math.round((progressTime / duration) * 100),
    [progressTime, duration]
  );
  const breadcrumbClick = useMemo(() => {
    return (match: TextMatch) => () =>
      dispatch({ type: VideoActions.SET_SELECTED, payload: match });
  }, []);
  return (
    <div className="relative h-10">
      {matches.map((match) => {
        const isSelected = match.id === selected?.id;

        const breadcrumbPosition = Math.round(
          (match.startSeconds / duration) * 100
        );

        return (
          <BreadCrumb
            key={match.id}
            onClick={breadcrumbClick(match)}
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
