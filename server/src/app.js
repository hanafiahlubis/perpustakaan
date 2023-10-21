import express from "express";
import cookieParser from "cookie-parser";
import login from "./routers/login.js";
import admin from "./routers/admin.js";
import user from "./routers/user.js";
import auth from "./middlewares/auth.js"

const app = express();

app.use(express.json());

const router = express.Router();


app.use(cookieParser());

router.use("/login", login)
router.use("/user", auth, user);
router.use("/admin", admin);

app.use("/api", router);

const PORT = 3000;
app.listen(PORT, console.log("Server sedang Berjaln di Port " + PORT));