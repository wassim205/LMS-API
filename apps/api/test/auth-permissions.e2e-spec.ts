import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Role } from '../src/common/enums/role.enum';

describe('Auth + Permissions (e2e)', () => {
  let app: INestApplication;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoServer.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
    if (mongoServer) await mongoServer.stop();
  });

  it('register + login sets cookies and allows access to /auth/profile', async () => {
    const agent = request.agent(app.getHttpServer());

    await agent.post('/auth/register').send({
      email: 'student1@test.com',
      password: 'password',
      firstName: 'Student',
      lastName: 'One',
    });

    const loginRes = await agent.post('/auth/login').send({
      email: 'student1@test.com',
      password: 'password',
    });

    expect(loginRes.status).toBe(201);
    expect(loginRes.headers['set-cookie']).toBeDefined();

    const profileRes = await agent.get('/auth/profile');
    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe('student1@test.com');
    expect(profileRes.body.password).toBeUndefined();
  });

  it('non-admin cannot update user role, admin can', async () => {
    const httpServer = app.getHttpServer();

    const studentAgent = request.agent(httpServer);

    const userToUpdateRes = await request(httpServer)
      .post('/auth/register')
      .send({
        email: 'student2@test.com',
        password: 'password',
        firstName: 'Student',
        lastName: 'Two',
      });

    expect(userToUpdateRes.status).toBe(201);
    const userToUpdateId = userToUpdateRes.body._id;

    await studentAgent.post('/auth/register').send({
      email: 'student3@test.com',
      password: 'password',
      firstName: 'Student',
      lastName: 'Three',
    });

    await studentAgent.post('/auth/login').send({
      email: 'student3@test.com',
      password: 'password',
    });

    const forbiddenRes = await studentAgent
      .patch(`/users/${userToUpdateId}/role`)
      .send({ role: Role.Admin });

    expect([401, 403]).toContain(forbiddenRes.status);

    const adminAgent = request.agent(httpServer);

    await adminAgent.post('/auth/register').send({
      email: 'admin@test.com',
      password: 'password',
      firstName: 'Admin',
      lastName: 'User',
      role: Role.Admin,
    });

    await adminAgent.post('/auth/login').send({
      email: 'admin@test.com',
      password: 'password',
    });

    const updateRes = await adminAgent
      .patch(`/users/${userToUpdateId}/role`)
      .send({ role: Role.Formateur });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.role).toBe(Role.Formateur);
  });
});
