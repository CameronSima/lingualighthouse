import { createContext } from "react";
import {
  initialState as initialVideoState,
  VideoReducerAction,
} from "~/reducers.ts/video.reducer";

export const VideoContext = createContext(initialVideoState);
export const VideoDispatchContext = createContext(
  (() => {}) as React.Dispatch<VideoReducerAction>
);
