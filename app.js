require('dotenv').config();
const express = require('express');
const multer = require('multer');
const ImageKit = require('imagekit');
const { PrismaClient } = require('@prisma/client');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aplikasi Galeri Seni',
      version: '1.0.0',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./app.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const upload = multer({ storage: multer.memoryStorage() });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Gambar:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         judul:
 *           type: string
 *         deskripsi:
 *           type: string
 *         url:
 *           type: string
 *         tanggalDiupload:
 *           type: string
 *           format: date-time
 *         tanggalDihapus:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /gambar:
 *   post:
 *     summary: Mengunggah gambar baru
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               gambar:
 *                 type: string
 *                 format: binary
 *               judul:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gambar berhasil diunggah
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gambar'
 *       500:
 *         description: Gagal mengunggah gambar
 */
app.post('/gambar', upload.single('gambar'), async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;
    const file = req.file;

    const imageKitResponse = await imagekit.upload({
      file: file.buffer.toString('base64'),
      fileName: file.originalname,
    });

    const gambarBaru = await prisma.gambar.create({
      data: {
        judul,
        deskripsi,
        url: imageKitResponse.url,
      },
    });

    res.status(201).json(gambarBaru);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengunggah gambar' });
  }
});

/**
 * @swagger
 * /gambar:
 *   get:
 *     summary: Mendapatkan daftar gambar
 *     responses:
 *       200:
 *         description: Daftar gambar berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Gambar'
 */
app.get('/gambar', async (req, res) => {
  const gambar = await prisma.gambar.findMany({
    where: { tanggalDihapus: null },
  });
  res.json(gambar);
});

/**
 * @swagger
 * /gambar/{id}:
 *   get:
 *     summary: Mendapatkan detail gambar
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID gambar yang ingin dilihat
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gambar berhasil ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gambar'
 *       404:
 *         description: Gambar tidak ditemukan
 */
app.get('/gambar/:id', async (req, res) => {
  const { id } = req.params;
  const gambar = await prisma.gambar.findFirst({
    where: { id: Number(id), tanggalDihapus: null },
  });

  if (!gambar) return res.status(404).json({ error: 'Gambar tidak ditemukan' });

  res.json(gambar);
});

/**
 * @swagger
 * /gambar/{id}:
 *   delete:
 *     summary: Menghapus gambar
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID gambar yang ingin dihapus
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Gambar berhasil dihapus
 *       404:
 *         description: Gambar tidak ditemukan
 */
app.delete('/gambar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const gambar = await prisma.gambar.update({
      where: { id: Number(id) },
      data: { tanggalDihapus: new Date() },
    });
    res.json({ pesan: 'Gambar dihapus', gambar });
  } catch (error) {
    res.status(404).json({ error: 'Gambar tidak ditemukan' });
  }
});

/**
 * @swagger
 * /gambar/{id}:
 *   put:
 *     summary: Memperbarui gambar
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID gambar yang ingin diperbarui
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *     responses:
 *       200:
 *         description: Gambar berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Gambar'
 *       404:
 *         description: Gambar tidak ditemukan
 */
app.put('/gambar/:id', async (req, res) => {
  const { id } = req.params;
  const { judul, deskripsi } = req.body;

  try {
    const gambarDiperbarui = await prisma.gambar.update({
      where: { id: Number(id) },
      data: { judul, deskripsi },
    });

    res.json(gambarDiperbarui);
  } catch (error) {
    res.status(404).json({ error: 'Gambar tidak ditemukan' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

module.exports = { app, server };