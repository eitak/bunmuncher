import Bundler from "parcel-bundler";
import express from "express";
import path from "path";

const app = express();

// Initialize a new bundler using a file and options
const __dirname = path.dirname(new URL(import.meta.url).pathname);
const bundler = new Bundler(path.join(__dirname, "./index.html"), {});

// Let express use the bundler middleware, this will let Parcel handle every request over your express server
app.use(bundler.middleware());

// Listen on port 1234
app.listen(1234, () => console.log("Listening on port 1234 🐰"));
