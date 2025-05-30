import request from 'supertest';
import app from '../../index';
import { prisma } from '../jest.setup';


const TEST_USERNAME = 'newuser';
const TEST_EMAIL    = 'newuser@example.com';

describe('AuthController Integration', () => {
  beforeAll(async () => {
    // Remove any leftover test user
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: TEST_USERNAME },
          { email: TEST_EMAIL }
        ]
      }
    });
  });

  afterAll(async () => {
    // Clean up test user so next run is fresh
    await prisma.user.deleteMany({
      where: {
        OR: [
          { username: TEST_USERNAME },
          { email: TEST_EMAIL }
        ]
      }
    });
  });

  it('should sign up a new user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: TEST_USERNAME,
        password: 'Password123',
        email:    TEST_EMAIL,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('should log in with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: TEST_USERNAME,
        password: 'Password123',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });

  it('should reject login for unknown user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'doesnotexist',
        password: 'whatever123',
      });

    // our JWT middleware + service now return 401 on “invalid” creds
    expect(res.status).toBe(401);
  });

  it('should return 409 when signing up with duplicate username or email', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        username: TEST_USERNAME,
        password: 'Password123',
        email:    TEST_EMAIL,
      });

    expect(res.status).toBe(409);
  });
});
