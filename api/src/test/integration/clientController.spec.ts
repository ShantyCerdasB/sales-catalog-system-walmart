import request from 'supertest';
import app from '../../index';
import { signLocalToken } from '../../utils/jwt';

let token: string;

beforeAll(() => {
  // setup.ts already upserts admin-id + role
  token = 'Bearer ' + signLocalToken({
    id:    'admin-id',
    email: 'admin@test.local',
    roles: ['ADMIN'],
  });
});

describe('ClientController Integration', () => {
  it('returns empty list initially', async () => {
    const res = await request(app)
      .get('/api/clients')
      .set('Authorization', token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('creates, reads, updates and soft-deletes a client', async () => {
    // create with a valid 3-char code and 8-digit NIT
    const create = await request(app)
      .post('/api/clients')
      .set('Authorization', token)
      .send({ code: 'ABC', name: 'Foo', nit: '12345678' });
    expect(create.status).toBe(201);
    const client = create.body;

    // read
    const got = await request(app)
      .get(`/api/clients/${client.id}`)
      .set('Authorization', token);
    expect(got.status).toBe(200);
    expect(got.body.code).toBe('ABC');

    // update
    const upd = await request(app)
      .patch(`/api/clients/${client.id}`)
      .set('Authorization', token)
      .send({ name: 'Bar' });
    expect(upd.status).toBe(200);
    expect(upd.body.name).toBe('Bar');

    // delete
    await request(app)
      .delete(`/api/clients/${client.id}`)
      .set('Authorization', token)
      .expect(204);

    // confirm gone
    await request(app)
      .get(`/api/clients/${client.id}`)
      .set('Authorization', token)
      .expect(404);
  });
});
