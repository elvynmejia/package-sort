import {
    type Request,
    type Response
} from "express";

import { get } from "../../../redis";

export default async (req: Request, res: Response) => {
    // id is the url, validate against this
    console.info("Entering /api/v1/videos/:id/status", { id: req.params.id });
    try {

        // await save(`id_to_image_url:${data.id}`, data.image_url);
        // await save(`video_generation_status_by_image_url:${data.image_url}`, "enqueued");

        // TODO: handle missing id
        const id = req.params.id;

        const image_url = await get(`id_to_image_url:${id}`);
        
        const status = await get(`video_generation_status_by_image_url:${image_url}`);

        if (!status) {
            return res
                .status(404)
                .json({ error: `Cannot find video status by given id: ${id}`})
        }

        return res
            .status(200)
            .json({
                video: {
                    status
                }
            });
    } catch (error: any) {
        return res
            .status(500)
            .json({ error: `Internal Server Error: ${error.message}`});
    }
};