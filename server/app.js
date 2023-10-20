import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";
import conn from "./db.js";
import auth from "./middlewares/auth.js";
const app = express();
app.use(express.json());

const domain = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "zoho.com", "protonmail.com", "tutanota.com", "mail.com"];

function falidasi(password) {
    const alpha = /^[0-9a-zA-Z]+$/;
    return !alpha.test(password) || !password.match(/[A-Z]/g) || !password.match(/[a-z]/g) ? false : true;
}

async function chekEmail(email) {
    return await conn.query(`select * from akun where email = "${email}" `);
}

app.use(cookieParser());
app.post("/api/register", async (req, res) => {
    try {
        let resuls = (await conn.query(`SELECT * FROM ADMIN WHERE email = "${req.body.email}"`));
        if (resuls.length === 0) {
            resuls = (await chekEmail(req.body.email));
        }

        if (resuls.length === 0) {
            const temp = req.body.email.split("@");
            if (domain.includes(temp[1])) {
                if (req.body.password.length >= 8 && falidasi(req.body.password)) {
                    const salt = await bcrypt.genSalt();
                    const hash = await bcrypt.hash(req.body.password, salt);
                    await conn.query(`INSERT INTO akun VALUES(DEFAULT, "${req.body.email}","${hash}","${req.body.name}")`);
                    res.send("Berhasil Menambah kan Akun ");
                } else {
                    res.send("Password Tidak Sesuai dengan Ketentuan");
                }
            } else {
                res.send("Domain Salah");
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

app.post("/", async (req, res) => {
    try {
        const temp = req.body.email.split("@");
        if (domain.includes(temp[1])) {
            if (req.body.password.length >= 8 && falidasi(req.body.password)) {
                const user = (await chekEmail(req.body.email));
                if (user.length > 0) {
                    if (await bcrypt.compare(req.body.password, user[0].password)) {
                        const token = jwt.sign(user[0], process.env.SECRET_KEY);
                        res
                            .cookie("jwt", token, {
                                httpOnly: true,
                                // secure: true,
                            })
                            .send("Login berhasil.");
                    } else {
                        res.status(401);
                        res.send("Kata sandi salah.");
                    }
                } else {
                    res.status(401);
                    res.send("Username tidak ditemukan.");

                }
            }
        } else {

            res.send("Domain Salah");
        }
    } catch (error) {
        res.send(404);
        res.send(error);
    }
});

app.use(auth);

app.get("/me", (req, res) => {
    res.json(req.user);
});


const PORT = 3000;
app.listen(PORT, console.log("Server sedang Berjaln di Port " + PORT));