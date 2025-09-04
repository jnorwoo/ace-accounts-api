import  express  from "express";
import PinoHttp from "pino-http";
import { logger } from "./logger";

export const app = express();


const pinoHttp = PinoHttp(logger);
app.use(pinoHttp);

app.get("/health", (req, res) => {
  req.log.info("Health check");
  res.json({ ok: true });
});

app.get("/accounts", (req, res) => {
  res.json({ items: [], nextPageToken: null });  
});

app.post("/accounts", (req, res) => {
    const id = "acc_" + Math.random().toString(36).substring(2, 10);
    res.status(201).json({ id, ...req.body });
});

app.get("/accounts/:id", (req, res) => {
    res.status(404).json({ error: "Account not found", id: req.params.id });
});

