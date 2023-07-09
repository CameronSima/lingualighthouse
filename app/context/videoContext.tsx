import { createContext, useReducer } from "react";
import {
  initialState as initialVideoState,
  videoReducer,
  VideoReducerAction,
} from "~/reducers/video.reducer";
import { TextMatch } from "~/transcript.server";

export const VideoContext = createContext(initialVideoState);
export const VideoDispatchContext = createContext(
  (() => {}) as React.Dispatch<VideoReducerAction>
);

export const VideoProvider = ({
  matches,
  children,
}: {
  matches: TextMatch[];
  children: React.ReactElement;
}) => {
  const [state, dispatch] = useReducer(videoReducer, {
    ...initialVideoState,
    matches,
  });

  return (
    <VideoContext.Provider value={state}>
      <VideoDispatchContext.Provider value={dispatch}>
        {children}
      </VideoDispatchContext.Provider>
    </VideoContext.Provider>
  );
};
