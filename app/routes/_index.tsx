import { ActionArgs, json, redirect, V2_MetaFunction } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { useState } from "react";
import TextTransition, { presets } from "react-text-transition";
import Spinner from "~/components/Spinner";
import useIsPageLoaded from "~/hooks/pageLoaded";
import { createSearch } from "~/models/search.server";
import { User } from "~/models/user.server";
import { getUser } from "~/session.server";
import { cleanVideoId, isCommonWord, useOptionalUser } from "~/utils";
import { getChannelIdFromUrl } from "~/youtube.server";

export const meta: V2_MetaFunction = () => [{ title: "Lingua Lighthouse" }];

export const action = async ({ request }: ActionArgs) => {
  const body = await request.formData();

  let videoOrChannelUrl = body.get("videoUrl");
  const searchText = body.get("searchText");
  const searchType = body.get("searchType");

  if (!videoOrChannelUrl || !searchText || !searchType) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  if (isCommonWord(searchText as string)) {
    return json(
      { error: "Search text is too common. Try something more unique!" },
      { status: 400 }
    );
  }

  const user = await getUser(request);

  if (searchType === "channel") {
    if (!user) {
      return json(
        { error: "Must be logged in to search a channel" },
        { status: 400 }
      );
    }
    const channelId = await getChannelIdFromUrl(videoOrChannelUrl as string);

    if (!channelId) {
      return json({ error: "Invalid channel url" }, { status: 400 });
    }

    await createSearch({
      userId: user.id,
      resourceId: channelId,
      searchText: searchText as string,
      searchType: "channel",
    });
    return redirect(`/jobs/${channelId}/${searchText}`);
  }

  if (user) {
    videoOrChannelUrl = cleanVideoId(videoOrChannelUrl as string);
    await createSearch({
      userId: user.id,
      resourceId: videoOrChannelUrl as string,
      searchText: searchText as string,
      searchType: "video",
    });
  }

  return redirect(`/${searchType}?id=${videoOrChannelUrl}&text=${searchText}`);
};

export default function Index() {
  const transition = useTransition();
  const data = useActionData<typeof action>();
  const user = useOptionalUser();
  const [videoId, setVideoId] = useState("");
  const [text, setText] = useState("");
  const [searchType, setSearchType] = useState<"video" | "channel">("video");
  const pageLoaded = useIsPageLoaded();

  const formValid = () => {
    const inputsValid = videoId.length > 5 && text.length >= 3;

    if (searchType === "channel") {
      return Boolean(user) && inputsValid && transition.state === "idle";
    }
    return inputsValid && transition.state === "idle";
  };

  const isDisabled = !formValid();

  return (
    <div className="flex h-[calc(100vh-80px)] flex-col justify-around">
      <h1 className="inline text-center text-4xl">
        <span className="mr-2">Search for text in a youtube</span>
        {pageLoaded && (
          <TextTransition springConfig={presets.stiff} inline>
            {searchType}
          </TextTransition>
        )}
      </h1>
      <div className="flex justify-center px-4">
        <Form method="post" className="flex w-full flex-col gap-y-4 md:w-3/4">
          <Warning user={user} searchType={searchType} />
          {data?.error && <ErrorDisplay error={data.error} />}
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
            {transition.state != "idle" ? <Spinner /> : "Submit"}
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

function Warning({
  user,
  searchType,
}: {
  user: User | undefined;
  searchType: string;
}) {
  if (searchType === "channel") {
    if (user) {
      // TODO: implement this
      //return <ChannelSearchWarning />;
    } else {
      return <MustBeLoggedIn />;
    }
  }
  return <></>;
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="border-l-4 border-red-500 bg-red-100 p-4 text-red-700">
      <p className="font-bold">Error: {error}</p>
    </div>
  );
}

// function ChannelSearchWarning() {
//   return (
//     <div className="flex flex-col gap-2">
//       <div className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700">
//         <p className="font-bold">
//           Searching a whole channel may take a few minutes. Would you like to be
//           notified when the search is complete?
//         </p>
//       </div>
//       {/* radio buttons */}
//       <div className="flex flex-col gap-2">
//         <label className="inline-flex items-center">
//           <input type="radio" className="form-radio" name="radio" value="1" />
//           <span className="ml-2">Yes, send me an email when it's complete</span>
//         </label>
//         <label className="inline-flex items-center">
//           <input type="radio" className="form-radio" name="radio" value="2" />
//           <span className="ml-2">No, I'll wait</span>
//         </label>
//       </div>
//     </div>
//   );
// }

function MustBeLoggedIn() {
  return (
    <div className="flex flex-col gap-2">
      <div className="border-l-4 border-yellow-500 bg-yellow-100 p-4">
        <p className="font-bold text-yellow-700">
          You must create an account and be logged in to search a whole channel.
        </p>
        <div className="mt-3">
          <Link className="font-bold underline" to="login">
            Login
          </Link>{" "}
          or{" "}
          <Link className="font-bold underline" to="join">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
