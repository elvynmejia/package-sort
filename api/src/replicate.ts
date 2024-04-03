import Replicate from "replicate";
const image2VideoWebHookUrl = process.env.IMAGE_TO_VIDEO_WEBHOOK_URL;

export const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    userAgent: "https://www.npmjs.com/package/create-replicate"
});

export const text2ImageModel =
  "cjwbw/videocrafter:02edcff3e9d2d11dcc27e530773d988df25462b1ee93ed0257b6f246de4797c8";
export const image2VideoModel =
  "cjwbw/videocrafter:7d1651ceadabf8bf68dd892ea7b59d7378d059c890ded583653f0cbf6fba3638";

export const createImageToVideo = async (imageUrl: string, prompt: string) => {
    console.log({ image2VideoWebHookUrl: image2VideoWebHookUrl + "/api/v1/webhooks/videos" });
    return replicate.run(image2VideoModel, {
        input: {
            task: "image2video",
            image: imageUrl,
            prompt: prompt,
            save_fps: 100,
            ddim_steps: 50,
            unconditional_guidance_scale: 12
        },
        webhook: image2VideoWebHookUrl + "/api/v1/webhooks/videos",
        webhook_events_filter: ["completed"] // all
    });
};
