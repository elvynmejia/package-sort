import {
    type Request,
    type Response
} from "express";

import { createImageToVideo } from "../../../replicate";

import admin from "../../../supabase";
import { save } from "../../../redis";

export default async (req: Request, res: Response) => {
    console.info("Entering, /api/v1/videos", req.body);

    try {
        const { prompt, image_url, user_id } = req.body;

        if ([prompt, image_url, user_id].some(key => key === "" || key == undefined || key === null)) {
            return res.status(422).json({ error: "Missing required prompt, image_url and user_id" });
        }

        const { data, error } = await admin
            .from("images")
            .insert({ image_url: image_url, status: "enqueued", user_id })
            .select()
            .single();
            
        if (error) {
            // raise to Sentry or something similar
            console.error("Error inserting images", { error,  prompt, image_url, user_id });
        }

        // TODO: isolate mapping here
        await save(`id_to_image_url:${data.id}`, data.image_url);
        await save(`video_generation_status_by_image_url:${data.image_url}`, "enqueued");

        createImageToVideo(image_url, prompt)
            .then((response) => {
                console.info("Successfully sent image to generate video", response);
            })
            .catch(async(err: any) => {
                await save(`video_generation_status_by_image_url${image_url}`, "error");
                await admin
                    .from("images")
                    .update({ status: "error" })
                    .eq("image_url", image_url);

                console.error("Error generating image to video", err);
            });
        return res
            .status(201)
            .json({
                video: { 
                    ...data
                }
            });
    } catch (error: any) {
        return res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
};