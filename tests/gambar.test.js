const request = require('supertest');
const { app, server } = require('../app');

jest.setTimeout(20000);

describe('API Gambar', () => {
  let gambarId;

  it('POST /gambar - Mengunggah gambar', async () => {
    const response = await request(app)
      .post('/gambar')
      .field('judul', 'Gambar Baru')
      .field('deskripsi', 'Deskripsi Gambar')
      .attach('gambar', 'tests/test.jpg');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    gambarId = response.body.id;
  });

  it('GET /gambar - Daftar gambar', async () => {
    const response = await request(app).get('/gambar');
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it('GET /gambar/:id - Detail gambar', async () => {
    const response = await request(app).get(`/gambar/${gambarId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', gambarId);
  });

  it('PUT /gambar/:id - Memperbarui gambar', async () => {
    const response = await request(app)
      .put(`/gambar/${gambarId}`)
      .send({ judul: 'Judul Baru', deskripsi: 'Deskripsi Baru' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('judul', 'Judul Baru');
  });

  it('DELETE /gambar/:id - Menghapus gambar', async () => {
    const response = await request(app).delete(`/gambar/${gambarId}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('pesan', 'Gambar dihapus');
  });

  afterAll(async () => {
    if (gambarId) {
      await request(app).delete(`/gambar/${gambarId}`);
    }
    server.close();
  });
});
