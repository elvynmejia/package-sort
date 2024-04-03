import {
    type Request,
    type Response
} from "express";

import admin from "../../../supabase";

export default async (req: Request, res: Response) => {
    console.info("Entering /api/v1/videos/:id", req.params.id);
    try {
        const id = req.params.id;

        const { data, error } = await admin
            .from("images")
            .select("*")
            .eq("id", id)
            .select()
            .single();
            
        if (error) {
            return res
                .status(404)
                .json({ error: `Cannot find video by given id: ${id}`})
        }

        return res
            .status(200)
            .json({
                video: {
                    ...data,
                    // id: data.id,
                    // url: data.video_url
                }
            });
    } catch (error: any) {
        return res.status(500).json({ error: `Internal Server Error: ${error.message}`});
    }
};