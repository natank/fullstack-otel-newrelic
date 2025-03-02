import "../shared/otel";
import express from "express";
import { countRequestsMiddleware } from "../shared/middleware";

const app = express();

app.use(countRequestsMiddleware);

app.get("/auth", (req, res) => {
  res.json({ username: "Michael Haberman" });
});

app.listen(8080, () => {
  console.log("service is up and running!");
});
