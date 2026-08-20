const request = require('supertest');
process.env.DB_PATH = ':memory:';
const app = require('./app');

test('GET /tasks returns a list of tasks', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});

test('POST /tasks creates a new task', async () => {
  const res = await request(app)
    .post('/tasks')
    .send({ title: 'Test task from Jest' });

  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe('Test task from Jest');
  expect(res.body.status).toBe('pending');
});

test('POST /tasks without a title returns 400', async () => {
  const res = await request(app)
    .post('/tasks')
    .send({});

  expect(res.statusCode).toBe(400);
});

test('PATCH /tasks/:id on a nonexistent task returns 404', async () => {
  const res = await request(app)
    .patch('/tasks/99999')
    .send({ status: 'done' });

  expect(res.statusCode).toBe(404);
});

test('DELETE /tasks/:id removes a task', async () => {
  const created = await request(app).post('/tasks').send({ title: 'To be deleted' });
  const id = created.body.id;

  const res = await request(app).delete(`/tasks/${id}`);
  expect(res.statusCode).toBe(204);

  const getRes = await request(app).get('/tasks');
  const stillExists = getRes.body.some(t => t.id === id);
  expect(stillExists).toBe(false);
});