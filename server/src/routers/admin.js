import express from "express";
import conn from "../db.js";
const router = express.Router();

router.get('/chek', async (req, res) => {
    try {
        const results = await conn.query(`SELECT b.name AS buku,b.pengarang,a.name,r.tgl_peminjeman ,r.tgl_pemulangan ,r. tgl_diserahkan  ,r.terlambat FROM riwayat_peminjaman r INNER JOIN buku b INNER JOIN akun a ON r.id_buku = b.id AND a.id = r.id_user WHERE r.terlambat = TRUE`);
        const data = results.map(result => {
            return { ...result, terlambat: "terlambat" };
        });
        let results2 = await conn.query(`SELECT b.name AS buku,b.pengarang,a.name,p.tgl_peminjeman ,p.tgl_pemulangan ,p. tgl_diserahkan FROM peminjaman p INNER JOIN buku b INNER JOIN akun a  ON a.id = p.id_user AND  b.id = p.id_buku WHERE p.status = "Dipinjam"  `);
        const data2 = results2.map(result => {
            return { ...result, tgl_diserahkan: "Belum diserahkan" };
        });
        res.json(data.concat(data2));
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
        res.send(error);
    }
});

export default router;