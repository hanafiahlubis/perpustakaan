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
        res.send(400);
        res.send(error);
    }
});

app.use(auth);

app.get("/me", (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});

async function pencatatan(data, user) {
    await conn.query(`INSERT INTO peminjaman (id_buku,id_user,tgl_peminjeman,tgl_pemulangan,STATUS) VALUES(${data.id_buku},${user},NOW(),"${data.tgl_pemulangan}","Dipinjam")`);
}
app.post("/pinjam", async (req, res) => {
    try {
        let result = await conn.query(`select * from buku where id = ${req.body.id_buku}`);
        if (result.length > 0) {
            result = await conn.query(`SELECT p.id_user,p.status,b.name FROM peminjaman p INNER JOIN buku b ON b.id = p.id_buku WHERE p.Status = "Dipinjam" AND p.id_user = ${req.user.id}`);
            console.log(result);
            if (result[0]?.status !== "Dipinjam") {
                pencatatan(req.body, req.user.id)
                res.send("Jangan Lupa di pulangkan yah!!!");
            } else {
                res.status(401);
                res.send(`PulangKan terlebih dahulu  Buku (${result[0].name}) yang anda pinjamkan `);
            }
        } else {
            res.status(401);
            res.send("Buku Tidak Ditemukan");
        }
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});


app.delete("/pengembalian/:id", async (req, res) => {
    try {
        let result = await conn.query(`SELECT tgl_peminjeman, tgl_pemulangan FROM peminjaman WHERE id_buku = ${req.body.id_buku} `);
        if (result.length > 0) {
            let peminjaman = new Date(result[0].tgl_peminjeman);
            let pemulangan = new Date(result[0].tgl_pemulangan);
            let serahkan = new Date(req.body.tgl_diserahkan);
            if (peminjaman <= serahkan && pemulangan >= serahkan) {
                await conn.query(`update peminjaman set tgl_diserahkan = "${serahkan}", status = 'TIdak Dipinjam', status_pengembalian = TRUE where id_buku = ${req.params.id}`);
                await conn.query(`DELETE FROM peminjaman WHERE id_buku = ${req.params.id} AND id_user = ${req.user.id} `);
                res.send("Berhasil Di Ubah");
            }
        } else {
            res.status(401);
            res.send("Tidak ada buku yang ditemukan");
        }
    } catch (error) {
        res.status(400);
        res.send(error);
    }
});

app.post("/logout", (_req, res) => {
    res.clearCookie("jwt").send("Logout berhasil.");
});

const PORT = 3000;
app.listen(PORT, console.log("Server sedang Berjaln di Port " + PORT));