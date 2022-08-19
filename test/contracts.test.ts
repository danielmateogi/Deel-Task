import app from '../src/app';
import request from 'supertest';
import { Contract } from '../src/model';

describe('Contract module testing', () => {
  it('GET /contracts unauthorized with non-existing profile id', async () => {
    return request(app)
      .get('/contracts')
      .set('profile_id', '-1')
      .expect(401)
      .expect((res) => {
        expect(res.body.error).toBe('Profile not found');
      });
  });

  it('GET /contracts unauthorized without profile', (done) => {
    request(app).get('/contracts').expect(401, done);
  });

  it('GET /contracts', async () => {
    return request(app)
      .get('/contracts')
      .set('profile_id', '2')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveLength(2);
        expect(res.body[0]).toHaveProperty('terms');
        expect(res.body[0]).toHaveProperty('status');
        /** If we're a client we expect the property contractor to be set */
        expect(res.body[0]).toHaveProperty('Contractor');
        expect(res.body[0]).toHaveProperty('Jobs');
        expect(res.body[0].Jobs).toHaveLength(4);
        expect(res.body[0].Jobs[0]).toHaveProperty('paid');
        const statuses = res.body.map((contract: Contract) => contract.status);
        expect(statuses).not.toContain('terminated');
      });
  });

  it('GET /contracts/:id', async () => {
    return request(app)
      .get('/contracts/1')
      .set('profile_id', '1')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(1);
        expect(res.body).toHaveProperty('terms');
        expect(res.body).toHaveProperty('status');
        expect(res.body.terms).toBe('bla bla bla');
        expect(res.body.status).toBe('terminated');
      });
  });

  it('GET /contracts/:id non-existing id', async () => {
    return request(app)
      .get('/contracts/20')
      .set('profile_id', '1')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('Contract not found');
      });
  });
});
