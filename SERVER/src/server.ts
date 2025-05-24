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
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

// get all the static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Import routes
import userRoute from "./Routes/user.route";
import albumRoute from "./Routes/album.route";
import mediaRoute from "./Routes/media.route";
app.use("/user", userRoute);
app.use("/album", albumRoute);
app.use("/media", mediaRoute);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
