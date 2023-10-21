import express from "express";
import cookieParser from "cookie-parser";
import login from "./routers/login.js";
import admin from "./routers/admin.js";
import user from "./routers/user.js";
import auth from "./middlewares/auth.js"
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
const router = express.Router();


app.use(cookieParser());

router.use("/login", login)
router.use("/user", auth, user);
router.use("/admin", admin);

app.use("/api", router);

const PORT = 3000;
app.listen(PORT, console.log("Server sedang Berjaln di Port " + PORT));