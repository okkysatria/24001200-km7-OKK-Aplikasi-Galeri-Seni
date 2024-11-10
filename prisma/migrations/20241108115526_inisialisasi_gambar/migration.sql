-- CreateTable
CREATE TABLE "Gambar" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tanggalDibuat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggalDihapus" TIMESTAMP(3),

    CONSTRAINT "Gambar_pkey" PRIMARY KEY ("id")
);
