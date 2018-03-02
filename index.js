import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import Promise from "bluebird";
import OAuthServer from "express-oauth-server";
import model from "./model";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.oauth = new OAuthServer({ model });
app.use("/oauth/token", app.oauth.token());
app.use("/oauth/authenticate", app.oauth.authenticate());
app.use("/oauth/authorize", app.oauth.authorize());

mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/oauth", {
  keepAlive: true,
  useMongoClient: true
});

mongoose.connection.on("error", err => {
  console.log("connection to mongodb server failed");
  console.log(err);
});

mongoose.connection.once("open", () => {
  console.log("connection to mongodb server was successful");
});

const PORT = process.env.PORT || 6060;

app.listen(PORT, () =>
  console.log(`oauthserverjs running at localhost: ${PORT}`)
);
