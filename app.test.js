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