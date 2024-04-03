import "./App.css";

import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { FileInput, Card, Loading, Textarea } from "react-daisyui";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

import usePolling from "./hooks/useStatus";

const API_URL = import.meta.env.VITE_API_URL;
const SUPABASE_API_URL = import.meta.env.VITE_SUPABASE_API_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  SUPABASE_API_URL,
  SUPABASE_ANON_KEY
);

const ALLOWED_IMAGE_EXTENSIONS = ["png", "jpg"];

const ANON_USER_ID = "ANON_USER_ID";

type Video = {
  id: string;
  status: string;
  image_url: string;
  video_url: string;
};

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [prompt, setPrompt] = useState("");

  const [video, setVideo] = useState<Video>({
    id: "",
    status: "",
    image_url: "",
    video_url: "",
  });

  useEffect(() => {
    if (!localStorage.getItem(ANON_USER_ID)) {
      localStorage.setItem(ANON_USER_ID, uuidv4());
    }
  }, []);

  const shouldPoll =
    (video?.id !== "" && video?.status === undefined) ||
    video?.status === null ||
    video?.status === "" ||
    video?.status === "enqueued" ||
    video?.status !== "error";

  const callback = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/videos/${id}`);
      setVideo({ 
        ...video,
        ...response.data.video
      });
    } catch (error) {
      console.error("============= something went wrong here ==============");
    }
  };

  // run this effect when ever video.id === "completed"
  useEffect(() => {
    if (videoRef.current && videoRef.current.src !== video.video_url) {
      videoRef.current.src = video.video_url;
      videoRef.current.load();
    }
  }, [video.video_url, video?.id]);


  const pollingState = usePolling(video?.id || "", shouldPoll, callback);

  const { data: pollingData, error: pollingError, isPolling } = pollingState;

  const showVideoPlaceHolder = shouldPoll && isPolling;

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();

    if (prompt === "") {
      alert("Please describe the scene you want based on the provided image");
      event.target.value = "";
      return;
    }

    if (event.target.files) {
      const image = event.target.files[0];
      const fileExt = image.name.split(".").pop()!;

      if (!ALLOWED_IMAGE_EXTENSIONS.includes(fileExt)) {
        alert(
          `Invalid file type. ${ALLOWED_IMAGE_EXTENSIONS.join(",")}. Given ${fileExt}`,
        );
        event.target.value = "";
        return;
      }

      const fileId = uuidv4();

      const fileName = `${fileId}.${fileExt}`;

      const { error } = await supabase.storage
        .from("images")
        .upload(fileName, image, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        alert("Unable to uplaod video. Please try again.");
        event.target.value = "";
        return;
      }

      const publicUrlResponse = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      const { publicUrl } = publicUrlResponse.data;

      setVideo({
        id: "",
        status: "",
        image_url: publicUrl,
        video_url: "",
      });

      try {
        const response = await axios.post(
          `${API_URL}/api/v1/videos`,
          {
            user_id: localStorage.getItem(ANON_USER_ID),
            image_url: publicUrl,
            prompt: prompt,
          },
        );

        console.log("respose from api/v1/videos", response.data);

        setVideo({
          id: response.data.video.id,
          status: response.data.video.status,
          image_url: response.data.video.image_url,
          video_url: "",
        });
      } catch (error: any) {
        event.target.value = "";
        alert(`An error accurred: ${error.message}. Try again`);
      }
    }
  };

  console.log({ pollingState });

  const getVideoContainer = () => {
    if (showVideoPlaceHolder) {
      return (
        <div
          className="flex items-center"
          style={{ width: 320, height: "100%" }}
        >
          <p>Generating video <Loading /> This will take awhile</p>
        </div>
      );
    } else if (video.video_url !== "") {
      return (
        <div
          className="flex items-center"
          style={{ width: "100%", height: "100%" }}
        >
          <video
            ref={videoRef}
            width="200px"
            height="200px"
            controls
            autoPlay
            loop
          >
            <source src={video?.video_url} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    return null;
  };

  const handlePromptChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
  }

  return (
    <div className="container">
      <h1 className="text-3xl font-bold">Bring your images to life</h1>
      <div className="py-10">
        <div className="flex w-full component-preview p-4 items-center justify-center gap-2 font-sans">
          <Textarea
            placeholder="Describe the scene" 
            size="lg" 
            onChange={handlePromptChange}
            value={prompt}
          />
        </div>
        <FileInput onChange={handleUpload} />
      </div>
      <div className="flex justify-center flex-row">
        <Card className="flex flex-row">
          {video?.image_url && (
            <img
              src={video?.image_url} 
              alt="uploaded picture"
              width="200px"
              height="200px"
            />
          )}
          <div>{getVideoContainer()}</div>
        </Card>
      </div>
    </div>
  );
}

export default App;
