import dotenv from "dotenv";
dotenv.config();

import express, {
    type Express,
    type Request,
    type Response
} from "express";
  
import morgan from "morgan";
import cors from "cors";
import http from "http";
  
import generateImageToVideoHandler from "./api/v1/images/generate_to_video";

import ImageToVideoWebhookHandler from "./api/v1/webhooks";
import statusHandler from "./api/v1/images/status";

import getVideoHandler from "./api/v1/images/get"

const app: Express = express();
  
app.use(cors());
app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
  
app.get("/api/v1/test", (req: Request, res: Response) => {
    res.status(200).send("OK");
});
  
app.post("/api/v1/videos", generateImageToVideoHandler);
app.post("/api/v1/webhooks/videos", ImageToVideoWebhookHandler);
app.get("/api/v1/videos/:id/status", statusHandler);
app.get("/api/v1/videos/:id", getVideoHandler);
  
const port = process.env.PORT || 5000;
  
app.set("port", port);
  
const server = http.createServer(app);
  
server.listen(port, () => {
    const logger = console;
    logger.info(`Listening on port: ${port}`);
});
  
export default server;