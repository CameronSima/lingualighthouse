import { ActionArgs, json, redirect, V2_MetaFunction } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useState } from "react";
import { getChannelIdFromUrl } from "~/youtube.server";

//import { useOptionalUser } from "~/utils";

export const meta: V2_MetaFunction = () => [{ title: "Lingua Lighthouse" }];

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();

  const videoOrChannelUrl = body.get("videoUrl");
  const searchText = body.get("searchText");
  const searchType = body.get("searchType");

  if (!videoOrChannelUrl || !searchText || !searchType) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  if (searchType === "channel") {
    const channelId = await getChannelIdFromUrl(videoOrChannelUrl as string);
    return redirect(`/jobs/${channelId}/${searchText}`);
  }
  return redirect(`/${searchType}?id=${videoOrChannelUrl}&text=${searchText}`);
};

export default function Index() {
  //const user = useOptionalUser();

  const [videoId, setVideoId] = useState("");
  const [text, setText] = useState("");
  const [searchType, setSearchType] = useState<"video" | "channel">("video");
  const isDisabled = videoId.length < 5 || text.length < 4;

  return (
    <div className="flex flex-col justify-around" style={{ height: "100%" }}>
      <h1 className="text-center text-4xl">
        Search for text in a youtube {searchType}
      </h1>
      <div className="flex justify-center px-4">
        <Form method="post" className="flex w-full flex-col gap-y-4 md:w-3/4">
          {searchType === "channel" && <Warning />}
          <select
            name="searchType"
            className="focus:shadow-outline w-full rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
            onChange={(e) => setSearchType(e.target.value as any)}
            value={searchType}
          >
            <option value="video">Video</option>
            <option value="channel">Entire channel</option>
          </select>

          <Input
            id="video_id"
            name="videoUrl"
            placeholder={`Youtube ${searchType} url`}
            value={videoId}
            onInput={(e: any) => setVideoId(e.target.value)}
          />
          <Input
            id="text"
            name="searchText"
            placeholder="Text to search for"
            value={text}
            onInput={(e: any) => setText(e.target.value)}
          />
          <button
            disabled={isDisabled}
            className={`focus:shadow-outline rounded ${
              isDisabled ? "bg-blue-100" : "bg-blue-500 hover:bg-blue-700"
            } px-4 py-2 font-bold text-white focus:outline-none`}
            type="submit"
          >
            Search
          </button>
        </Form>
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
