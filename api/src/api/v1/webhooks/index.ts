import {
    type Request,
    type Response
} from "express";

import supabase from "../../../supabase";
import { save } from "../../../redis";

export default async(req: Request, res: Response) => {
    console.info("Entering /api/v1/webhooks/videos", req.body);
    try {
        const { status, input, output } = req.body;

        if (status === "succeeded") {
            const { error } = await supabase
                .from("images")
                .update({ video_url: output, status: "completed" })
                .eq("image_url", input.image);

            if (error) {
                console.error("Error saving resulting image2video video url", { status, input, output });
            }
            
            await save(`video_generation_status_by_image_url:${input.image}`, "completed");
        }
        return res.status(200).json({});
    } catch (error: any) {
        return res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
};