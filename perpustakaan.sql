CREATE OR REPLACE DATABASE  perpustakaan;
USE perpustakaan;
CREATE OR REPLACE TABLE ADMIN(
	id INT AUTO_INCREMENT PRIMARY KEY,
	email TEXT,
	PASSWORD TEXT,
	`name` TEXT
);

INSERT INTO ADMIN VALUES(DEFAULT, "alihanafiah@gmail.com","$2a$10$OeIRectpnG4gHduPbbWiDe8tfdg/Fk5t7s56W4HX14WWTQA2BuHWq","Ali Hanafiah");

CREATE OR REPLACE TABLE akun(
	id INT AUTO_INCREMENT PRIMARY KEY,
	email TEXT,
	`password` TEXT,
	NAME TEXT
);

CREATE OR REPLACE TABLE kategori(
	id INT AUTO_INCREMENT PRIMARY KEY,
	`name` TEXT NOT NULL
);

INSERT INTO kategori VALUES(DEFAULT, "Romantis2");

CREATE OR REPLACE TABLE buku(
	id INT AUTO_INCREMENT PRIMARY KEY,
	`name` TEXT NOT NULL,
	pengarang TEXT NOT NULL,
	id_kategori INT,
	CONSTRAINT kategori FOREIGN KEY (id_kategori) REFERENCES kategori (id)
);

INSERT INTO buku VALUES
(DEFAULT, "Ayat Ayat Cinta ", "Nicholas Sparks",1),
(DEFAULT, "The Notebook", "Nicholas Sparks",1),
(DEFAULT, "The Fault in Our Stars ", "Jojo Moyes",1),
(DEFAULT, "Me Before You ", "Audrey Niffenegger",1);

SELECT b.name, MAX(b.harga) FROM buku b INNER JOIN kategori k ON k.id = b.id_kategori ;
SELECT k.name,COUNT(*) AS total  FROM buku b INNER JOIN kategori k ON k.id = b.id_kategori GROUP BY id_kategori ORDER BY total ASC;


CREATE OR REPLACE TABLE peminjaman(
	id INT AUTO_INCREMENT PRIMARY KEY,
	id_buku INT,
	id_user INT,
	tgl_peminjeman DATE,
	tgl_pemulangan DATE,
	tgl_diserahkan DATE,
	`status` ENUM("Dipinjam","TIdak Dipinjam"),
	status_pengembalian BOOLEAN,	
	terlambat BOOLEAN,
	CONSTRAINT `user` FOREIGN KEY (id_user) REFERENCES akun (id),
	CONSTRAINT buku FOREIGN KEY (id_buku) REFERENCES buku (id)
);

CREATE TABLE riwayat_peminjaman LIKE peminjaman;

DELIMITER $$
CREATE OR REPLACE TRIGGER riwayat_peminjaman
AFTER DELETE
ON peminjaman
FOR EACH ROW 
BEGIN
    INSERT INTO riwayat_peminjaman VALUES (old.id, old.id_buku, old.id_user, old.tgl_peminjeman, old.tgl_pemulangan, old.tgl_diserahkan, old.status , old.status_pengembalian,old.terlambat);
END $$
    