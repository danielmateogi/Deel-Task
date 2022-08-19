import app from '../src/app';
import request from 'supertest';
import { BestClient } from '../src/modules/admin';

const dateOldISO = new Date('2015-01-01').toISOString();
const dateNowISO = new Date().toISOString();

describe('Admin module testing', () => {
  it('GET /admin/best-clients fail with no start date', async () => {
    return request(app)
      .get('/admin/best-clients')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"start\" is required");
      });
  });

  it('GET /admin/best-clients fail with no end date', async () => {
    return request(app)
      .get('/admin/best-clients?start=2020-01-01')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"end\" is required");
      });
  });

  it('GET /admin/best-clients fail with invalid dates', async () => {
    return request(app)
      .get('/admin/best-clients?start=2020.01.01')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"start\" must be in ISO 8601 date format");
      });
  });

  it('GET /admin/best-clients fail with limit less than 1', async () => {
    return request(app)
      .get(`/admin/best-clients?start=${dateOldISO}&end=${dateNowISO}&limit=-1`)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"limit\" must be greater than or equal to 1");
      });
  });

  it('GET /admin/best-clients fail with invalid limit', async () => {
    return request(app)
      .get(`/admin/best-clients?start=${dateOldISO}&end=${dateNowISO}&limit=a`)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"limit\" must be a number");
      });
  });

  it('GET /admin/best-clients fail with limit over 100', async () => {
    return request(app)
      .get(`/admin/best-clients?start=${dateOldISO}&end=${dateNowISO}&limit=101`)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"limit\" must be less than or equal to 100");
      });
  });

  it('GET /admin/best-clients normal flow default limit', async () => {
    return request(app)
      .get(`/admin/best-clients?start=${dateOldISO}&end=${dateNowISO}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty('fullName');
        expect(res.body[0]).toHaveProperty('paid');
        expect(res.body[0]).toHaveProperty('id');
        
        const payments = res.body.map((client: BestClient) => client.paid);
        /** Expect the result to be sorted descending based on paid amount */
        expect(payments).toStrictEqual([...payments].sort((a, b) => b - a));
      });
  });

  it('GET /admin/best-clients normal flow custom limit', async () => {
    return request(app)
      .get(`/admin/best-clients?start=${dateOldISO}&end=${dateNowISO}&limit=3`)
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBe(3);
        expect(res.body[0]).toHaveProperty('fullName');
        expect(res.body[0]).toHaveProperty('paid');
        expect(res.body[0]).toHaveProperty('id');
        
        const payments = res.body.map((client: BestClient) => client.paid);
        /** Expect the result to be sorted descending based on paid amount */
        expect(payments).toStrictEqual([...payments].sort((a, b) => b - a));
      });
  });

  it('GET /admin/best-profession fail with no start date', async () => {
    return request(app)
      .get('/admin/best-profession')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"start\" is required");
      });
  });

  it('GET /admin/best-profession fail with no end date', async () => {
    return request(app)
      .get('/admin/best-profession?start=2020-01-01')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"end\" is required");
      });
  });

  it('GET /admin/best-profession fail with invalid dates', async () => {
    return request(app)
      .get('/admin/best-profession?start=2020.01.01')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe("\"start\" must be in ISO 8601 date format");
      });
  });

  it('GET /admin/best-profession normal flow', async () => {
    return request(app)
      .get(`/admin/best-profession?start=${dateOldISO}&end=${dateNowISO}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.profession).toBe('Programmer');
        expect(res.body.total).toBeGreaterThan(0);
      });
  });
});
