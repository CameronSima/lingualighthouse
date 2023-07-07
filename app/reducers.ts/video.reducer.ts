import { Reducer } from "react";

export const initialState = {
  seekTime: 0,
  duration: 0,
  isPlaying: false,
  isPlayingAllMatches: false,
  videoLoaded: false,
};

export enum VideoActions {
  PLAY = "PLAY",
  PAUSE = "PAUSE",
  PLAY_ALL = "PLAY_ALL",
  PLAY_ALL_STOP = "PLAY_ALL_STOP",
  SET_SEEK_TIME = "SET_SEEK_TIME",
  SET_DURATION = "SET_DURATION",
  SET_VIDEO_LOADED = "SET_VIDEO_LOADED",
}

export type PlayAction = {
  type: VideoActions.PLAY;
};

export type PauseAction = {
  type: VideoActions.PAUSE;
};

export type PlayAllAction = {
  type: VideoActions.PLAY_ALL;
};

export type PlayAllStopAction = {
  type: VideoActions.PLAY_ALL_STOP;
};

export type SetSeekTimeAction = {
  type: VideoActions.SET_SEEK_TIME;
  payload: number;
};

export type SetDurationAction = {
  type: VideoActions.SET_DURATION;
  payload: number;
};

export type SetVideoLoadedAction = {
  type: VideoActions.SET_VIDEO_LOADED;
};

export type VideoReducerAction =
  | PlayAction
  | PauseAction
  | PlayAllAction
  | PlayAllStopAction
  | SetSeekTimeAction
  | SetDurationAction
  | SetVideoLoadedAction;

export const videoReducer: Reducer<typeof initialState, VideoReducerAction> = (
  state,
  action
) => {
  switch (action.type) {
    case VideoActions.PLAY:
      return { ...state, isPlaying: true };
    case VideoActions.PAUSE:
      return { ...state, isPlaying: false };
    case VideoActions.PLAY_ALL:
      return { ...state, isPlayingAllMatches: true };
    case VideoActions.PLAY_ALL_STOP:
      return { ...state, isPlayingAllMatches: false };
    case VideoActions.SET_SEEK_TIME:
      return { ...state, seekTime: action.payload };
    case VideoActions.SET_DURATION:
      return { ...state, duration: action.payload };
    case VideoActions.SET_VIDEO_LOADED:
      return { ...state, videoLoaded: true };
    default:
      return state;
  }
};
