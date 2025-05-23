import express from "express";
import dotenv from "dotenv";
import cors from "cors";


dotenv.config();
const app = express();

app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true
    }
));
app.use(express.json());

import userRoute from "./Routes/user.route";
app.use("/user", userRoute);




app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

