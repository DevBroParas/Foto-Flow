import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(cookieParser());

// get all the static files from the uploads directory
// app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
// Import routes
import userRoute from "./Routes/user.route";
import albumRoute from "./Routes/album.route";
import mediaRoute from "./Routes/media.route";
import recognizeRoute from "./Routes/recognize.route";
import personRoute from "./Routes/person.route";
import faceRoute from "./Routes/face.route";
import bin from "./Routes/bin.route";
app.use("/user", userRoute);
app.use("/album", albumRoute);
app.use("/media", mediaRoute);
app.use("/recognize", recognizeRoute);
app.use("/person", personRoute);
app.use("/face", faceRoute);
app.use("/bin", bin);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
