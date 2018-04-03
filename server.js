import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import oauth from "./oauth";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/oauth/token", oauth.token());
app.post("/oauth/client", oauth.client());
//app.use("/oauth/authenticate", app.oauth.authenticate());
//app.use("/oauth/authorize", app.oauth.authorize());

const PORT = process.env.PORT || 4000;

app.listen(PORT, () =>
  console.info(`Authorization Server running at localhost:${PORT}`)
);
