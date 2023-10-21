import express from "express";
import conn from "../db.js";
const router = express.Router();

async function pencatatan(data, user) {
    await conn.query(`INSERT INTO peminjaman (id_buku,id_user,tgl_peminjeman,tgl_pemulangan,STATUS) VALUES(${data.id_buku},${user},NOW(),"${data.tgl_pemulangan}","Dipinjam")`);
}

router.get("/all", async (_req, res) => {
    try {
        const results = await conn.query("SELECT * FROM buku");
        res.json(results);
    } catch (error) {
        res.status(400);
        res.send(error);
    }
})

router.post("/pinjam", async (req, res) => {
    try {
        console.log(req.user);
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
        console.log(error);
        res.send(error);
    }
});

router.delete("/pengembalian/:id", async (req, res) => {
    try {
        let result = await conn.query(`SELECT tgl_peminjeman, tgl_pemulangan FROM peminjaman WHERE id_buku = ${req.body.id_buku} `);
        if (result.length > 0) {
            let peminjaman = new Date(result[0].tgl_peminjeman);
            let pemulangan = new Date(result[0].tgl_pemulangan);
            let serahkan = new Date(req.body.tgl_diserahkan);
            if (peminjaman <= serahkan && pemulangan >= serahkan) {
                await conn.query(`update peminjaman set tgl_diserahkan = "${req.body.tgl_diserahkan}", status = 'TIdak Dipinjam', status_pengembalian = TRUE, terlambat = FALSE where id_buku = ${req.params.id}`);
                await conn.query(`DELETE FROM peminjaman WHERE id_buku = ${req.params.id} AND id_user = ${req.user.id} `);
                res.send("Berhasil Di Ubah");
            }
            else {
                await conn.query(`update peminjaman set tgl_diserahkan = "${req.body.tgl_diserahkan}", status = 'TIdak Dipinjam', status_pengembalian = TRUE,terlambat = TRUE where id_buku = ${req.params.id}`);
                await conn.query(`DELETE FROM peminjaman WHERE id_buku = ${req.params.id} AND id_user = ${req.user.id} `);
                res.send("Berhasil Di Ubah");
            }
        } else {
            res.status(401);
            res.send("Tidak ada buku yang ditemukan");
        }
    } catch (error) {
        res.status(400);
        console.log(error);
        res.send(error);
    }
});

export default router;