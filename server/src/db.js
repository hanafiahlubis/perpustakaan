import mariadb from 'mariadb';
import dotenv from "dotenv";
dotenv.config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const conn = await pool.getConnection();
export default conn;