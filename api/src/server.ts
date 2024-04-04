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

import sortPackageHandler from "./api/v1/packages/sort";


const app: Express = express();
  
app.use(cors());
app.use(express.json());
app.use(morgan("common"));
app.use(express.urlencoded({ extended: false }));
  
app.get("/", (req: Request, res: Response) => {
    res.status(200).send("OK");
});

app.post("/api/v1/packages/sort", sortPackageHandler);

const port = process.env.PORT || 5000;
  
app.set("port", port);
  
const server = http.createServer(app);
  
server.listen(port, () => {
    const logger = console;
    logger.info(`Listening on port: ${port}`);
});
  
export default server;