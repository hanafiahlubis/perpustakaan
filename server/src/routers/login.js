import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import conn from "../db.js";
import auth from "../middlewares/auth.js"

const router = express.Router();
const domain = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "zoho.com", "protonmail.com", "tutanota.com", "mail.com"];

function falidasi(password) {
    const alpha = /^[0-9a-zA-Z]+$/;
    return !alpha.test(password) || !password.match(/[A-Z]/g) || !password.match(/[a-z]/g) ? false : true;
}

async function chekEmail(email) {
    return await conn.query(`select * from akun where email = "${email}" `);
}

router.post("/register", async (req, res) => {
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
                    res.status(401);
                    res.send("Password Tidak Sesuai dengan Ketentuan");
                }
            } else {
                res.status(401);
                res.send("Domain Salah");
            }
        } else {
            res.status(401);
            res.send("Email Sudah ada");
        }
    }
    catch (error) {
        res.send(400);
        res.send(error);
    }
});

router.post("/", async (req, res) => {
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
        res.send(400);
        res.send(error);
    }
});

router.use(auth);

router.get("/me", (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});
router.post("/logout", (_req, res) => {
    res.clearCookie("jwt").send("Logout berhasil.");
});
export default router;