import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { MongoClient } from 'mongodb';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('End-to-end tests', () => {
  let app: INestApplication;
  let jwtToken: string;
  let csrfToken: string;
  let csrfKey: string;
  let db;
  let client;

  const csrfExtractor = (response: request.Response) => {
    csrfToken = response.headers['x-csrf-token'];
    if (!csrfKey)
      csrfKey = response.header['set-cookie']
        .map((cookie) => cookie.split(';')[0])[0]
        .split('=')[1];
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ConfigModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const configService = moduleFixture.get<ConfigService>(ConfigService);
    const mongodbUri = configService.get<string>('MONGO_URI');

    client = await MongoClient.connect(mongodbUri);
    db = client.db('test');
  });

  it('should fetch CSRF token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/token')
      .set('x-api-version', '1')
      .expect(200);

    csrfExtractor(response);

    expect(csrfToken).toBeDefined();
  });

  it('should register a new user', async () => {
    return await request(app.getHttpServer())
      .post('/auth/register')
      .set('x-api-version', '1')
      .set('x-csrf-token', csrfToken)
      .set('Cookie', [`csrf_token_httponly=${csrfToken}`, `_csrf=${csrfKey}`])
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(201);
  });

  it('should login the user and return JWT token', async () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .set('x-api-version', '1')
      .set('x-csrf-token', csrfToken)
      .set('Cookie', [`csrf_token_httponly=${csrfToken}`, `_csrf=${csrfKey}`])
      .send({ username: 'testuser', password: 'testpassword' })
      .expect(200)
      .expect((res) => {
        jwtToken = res.body.jwt.accessToken;
        expect(res.body).toHaveProperty('jwt');
      });
  });

  it('should access user route with valid JWT token', async () => {
    return request(app.getHttpServer())
      .get('/user')
      .set('x-api-version', '1')
      .set('x-csrf-token', csrfToken)
      .set('Cookie', [`csrf_token_httponly=${csrfToken}`, `_csrf=${csrfKey}`])
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'Success');
      });
  });

  it('should not access admin route without admin role', async () => {
    return request(app.getHttpServer())
      .get('/admin')
      .set('x-api-version', '1')
      .set('x-csrf-token', csrfToken)
      .set('Cookie', [`csrf_token_httponly=${csrfToken}`, `_csrf=${csrfKey}`])
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(403);
  });

  afterAll(async () => {
    if (db) {
      await db.collection('users').deleteOne({ username: 'testuser' });
    }

    if (client) {
      await client.close();
    }

    await app.close();
  });
});
