import express, { query } from "express";
import conn from "./db.js";

const app = express();
app.use(express.json());

const domain = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "zoho.com", "protonmail.com", "tutanota.com", "mail.com"];

function falidasi(password) {
    const alpha = /^[0-9a-zA-Z]+$/;
    return !alpha.test(password) || !password.match(/[A-Z]/g) || !password.match(/[a-z]/g) ? false : true;
}

app.post("/api/register", async (req, res) => {
    try {
        let chek = false;
        chek = (await conn.query(`SELECT * FROM ADMIN WHERE email = "${req.body.email}"`)).length !== 0;
        if (!chek && await conn.query(`SELECT * FROM akun WHERE email = "${req.body.email}"`).length !== 0) {
            if (req.body.password.length >= 8 && falidasi(req.body.password)) {
                console.log("xnxx");
            }
        } else {
            res.send("Email Sudah ada");
        }



    }
    catch (error) {
        res.send(404);
        res.send(error);
    }
});

app.get("/", (req, res) => {
    res.send();
});

const PORT = 3000;
app.listen(PORT, console.log("Server sedang Berjaln di Port " + PORT));