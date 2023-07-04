import type { V2_MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";

//import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Lingua Lighthouse" }];

export default function Index() {
  //const user = useOptionalUser();

  const navigate = useNavigate();
  const [videoId, setVideoId] = useState("");
  const [text, setText] = useState("");
  const [searchType, setSearchType] = useState<"video" | "channel">("video");
  const isDisabled = videoId === "" || text === "";

  const submit = () => {
    if (isDisabled) return;
    const url = `/${searchType}?id=${videoId}&text=${text}`;
    navigate(url);
  };

  return (
    <div className="flex flex-col justify-around" style={{ height: "100%" }}>
      <h1 className="text-center text-4xl">
        Search for text in a youtube {searchType}
      </h1>
      <div className="flex justify-center px-4">
        <div className="flex w-full flex-col gap-y-4 md:w-3/4">
          {searchType === "channel" && <Warning />}
          <select
            className="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            onChange={(e) => setSearchType(e.target.value as any)}
            value={searchType}
          >
            <option value="video">Video</option>
            <option value="channel">Entire channel</option>
          </select>

          <Input
            id="video_id"
            name="video_id"
            placeholder={`Youtube ${searchType} url`}
            value={videoId}
            onInput={(e: any) => setVideoId(e.target.value)}
          />
          <Input
            id="text"
            name="text"
            placeholder="Text to search for"
            value={text}
            onInput={(e: any) => setText(e.target.value)}
          />
          <button
            disabled={isDisabled}
            onClick={submit}
            className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
            type="button"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

function Input({
  id,
  name,
  placeholder,
  value,
  onInput,
}: {
  id: string;
  name: string;
  placeholder: string;
  value: string;
  onInput: (e: any) => void;
}) {
  return (
    <input
      className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
      id={id}
      name={name}
      value={value}
      type="text"
      placeholder={placeholder}
      onInput={onInput}
    />
  );
}

function Warning() {
  return (
    <div className="flex flex-col gap-2">
      <div className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
        <p className="font-bold">
          Searching a whole channel may take a few minutes. Would you like to be
          notified when the search is complete?
        </p>
      </div>
      {/* radio buttons */}
      <div className="flex flex-col gap-2">
        <label className="inline-flex items-center">
          <input type="radio" className="form-radio" name="radio" value="1" />
          <span className="ml-2">Yes, send me an email when it's complete</span>
        </label>
        <label className="inline-flex items-center">
          <input type="radio" className="form-radio" name="radio" value="2" />
          <span className="ml-2">No, I'll wait</span>
        </label>
      </div>
    </div>
  );
}
