import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app/app.module';

describe('RBAC + Auth (e2e)', () => {
  let app: INestApplication;

  const owner = { email: 'owner_e2e@test.com', fullName: 'Owner', password: 'secret123' };
  const viewer = { email: 'viewer_e2e@test.com', fullName: 'Viewer', password: 'secret123' };

  let ownerToken = '';
  let viewerToken = '';
  let ownerOrgId = '';

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    await app.init();

    const regOwner = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(owner)
      .expect(201);

    ownerToken = regOwner.body.accessToken;

    const ownerLogs = await request(app.getHttpServer())
      .get('/api/audit-log')
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);

    ownerOrgId = ownerLogs.body[0].org.id;

    const regViewer = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(viewer)
      .expect(201);

    viewerToken = regViewer.body.accessToken;

    await request(app.getHttpServer())
      .post('/api/rbac/add-member')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ orgId: ownerOrgId, email: viewer.email, role: 'VIEWER' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  it('VIEWER cannot create task (403)', async () => {
    await request(app.getHttpServer())
      .post(`/api/tasks?orgId=${ownerOrgId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ title: 'nope', status: 'TODO', category: 'WORK' })
      .expect(403);
  });

  it('VIEWER cannot view audit log for org (403)', async () => {
    await request(app.getHttpServer())
      .get(`/api/audit-log?orgId=${ownerOrgId}`)
      .set('Authorization', `Bearer ${viewerToken}`)
      .expect(403);
  });

  it('OWNER can create task (201)', async () => {
    await request(app.getHttpServer())
      .post(`/api/tasks?orgId=${ownerOrgId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ title: 'ok', status: 'TODO', category: 'PERSONAL' })
      .expect(201);
  });

  it('List tasks supports filters + sorting (200)', async () => {
    await request(app.getHttpServer())
      .get(`/api/tasks?orgId=${ownerOrgId}&category=PERSONAL&sort=createdAt_desc`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .expect(200);
  });
});
