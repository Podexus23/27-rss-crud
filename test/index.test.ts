import request from 'supertest';
import { server } from '../src/index';

describe('1. Test base functionality of methods GET POST PUT DELETE', () => {
  const testID = 'fbf589e0-942f-11ed-b879-91858c42770e';
  it('GET /api/users', async () => {
    const app = await request(server).get('/api/users');
    expect(app.statusCode).toBe(200);
    expect(app.body.data.length).toBe(2);
  });
  it('GET /api/users/{userID}', async () => {
    const app = await request(server).get(`/api/users/${testID}`);
    expect(app.statusCode).toBe(200);
    expect(app.body.data).toStrictEqual({
      username: 'Boo',
      age: 12,
      hobbies: ['some hobbies'],
      id: 'fbf589e0-942f-11ed-b879-91858c42770e',
    });
  });
  it('POST /api/users', async () => {
    const newUserData = {
      username: 'Bombaster',
      age: 23,
      hobbies: ['jogging'],
    };
    const app = await request(server)
      .post('/api/users')
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(201);
    const newID = app.body.data.id;
    expect(app.body.data).toStrictEqual({
      ...newUserData,
      id: newID,
    });
  });
  it('PUT /api/users/{userID}', async () => {
    const newUserData = {
      username: 'Bombaster',
      age: 23,
      hobbies: ['jogging'],
      id: testID,
    };
    const app = await request(server)
      .put(`/api/users/${testID}`)
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(200);
    expect(app.body.data).toStrictEqual(newUserData);
  });
  it('DELETE /api/users/{userID}', async () => {
    const app = await request(server).delete(`/api/users/${testID}`);
    expect(app.statusCode).toBe(204);
  });
  it('GET deleted object', async () => {
    const app = await request(server).get(`/api/users/${testID}`);
    expect(app.statusCode).toBe(404);
    expect(app.body.data).toBe('User not found');
  });
});

describe('2. Test for wrong body or ID', () => {
  const testID = 'fbf589e0-942f-11ed-b879-91858c42770e';
  const testID2 = '7c186260-942f-11ed-b879-91858c42770e';
  it('GET wrong ID /api/users/{userID}', async () => {
    const app = await request(server).get(`/api/users/${testID}2`);
    expect(app.statusCode).toBe(400);
    expect(app.body.data).toBe('sorry wrong ID');
  });
  it('POST wrong Body type /api/users', async () => {
    const newUserData = {
      username: 'Bombaster',
      age: '23',
      hobbies: ['jogging'],
    };
    const app = await request(server)
      .post('/api/users')
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(400);
    expect(app.body.data).toBe('Body does not contain required fields or type is wrong');
  });
  it('PUT wrong ID /api/users/{userID}', async () => {
    const newUserData = {
      username: 'Bombaster',
      age: 23,
      hobbies: ['jogging'],
      id: testID,
    };
    const app = await request(server)
      .put(`/api/users/${testID}a`)
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(400);
    expect(app.body.data).toBe('sorry wrong ID');
  });
  it('PUT wrong body /api/users/{userID}', async () => {
    const newUserData = {
      username: 'Bombaster',
      hobbies: ['jogging'],
      id: testID,
    };
    const app = await request(server)
      .put(`/api/users/${testID2}`)
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(400);
    expect(app.body.data).toBe('Body does not contain required fields or type is wrong');
  });
  it('DELETE wrong ID /api/users/{userID}', async () => {
    const app = await request(server).delete(`/api/users/${testID}a`);
    expect(app.statusCode).toBe(400);
    expect(app.body.data).toBe('sorry wrong ID');
  });
});

describe('3. Test 404 situations', () => {
  const testID = 'fbf589e0-942f-11ed-b879-91858c42770e';
  it('wrong address /api/use', async () => {
    const app = await request(server).get('/api/use');
    expect(app.statusCode).toBe(404);
    expect(app.body.data).toBe('Sorry. Page not found');
  });
  it('GET valid ID but user deleted /api/users/{userID}', async () => {
    const app = await request(server).get(`/api/users/${testID}`);
    expect(app.statusCode).toBe(404);
    expect(app.body.data).toBe('User not found');
  });
  it('PUT valid ID but not in a base /api/users/{userID}', async () => {
    const newUserData = {
      username: 'Bombaster',
      age: 23,
      hobbies: ['jogging'],
      id: testID,
    };
    const app = await request(server)
      .put(`/api/users/${testID}`)
      .set('Content-type', 'application/json')
      .send(newUserData);
    expect(app.statusCode).toBe(404);
    expect(app.body.data).toBe('User not found');
  });
  it('DELETE valid ID but not in a base /api/users/{userID}', async () => {
    const app = await request(server).delete(`/api/users/${testID}`);
    expect(app.statusCode).toBe(404);
    expect(app.body.data).toBe('User not found');
  });
});
afterAll((done) => {
  server.close();
  done();
});
