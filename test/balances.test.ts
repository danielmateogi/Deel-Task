/* eslint-disable @typescript-eslint/no-non-null-assertion */
import app from '../src/app';
import request from 'supertest';
import { getUnpaidJobsTotal } from '../src/modules/balances';
import { Profile } from '../src/model';

describe('Balance module testing', () => {
  it('POST /balances/deposit/:userId without amount sent', async () => {
    return request(app)
      .post('/balances/deposit/2')
      .set('profile_id', '2')
      .expect('Content-Type', /json/)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Amount is required');
      });
  });

  it('POST /balances/deposit/:userId with non-existing user', async () => {
    return request(app)
      .post('/balances/deposit/100')
      .send({ amount: 100 })
      .set('profile_id', '2')
      .expect('Content-Type', /json/)
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('User not found');
      });
  });

  it('POST /balances/deposit/:userId with non-client user', async () => {
    return request(app)
      .post('/balances/deposit/6')
      .send({ amount: 100 })
      .set('profile_id', '6')
      .expect('Content-Type', /json/)
      .expect(403)
      .expect((res) => {
        expect(res.body.error).toBe('Only clients can deposit money');
      });
  });

  it('POST /balances/deposit/:userId deposit over limit of 25% of unpaid jobs', async () => {
    const unpaidJobsTotal = await getUnpaidJobsTotal(4);
    const maxDeposit = Math.floor(unpaidJobsTotal.total * 0.25);
    return request(app)
      .post('/balances/deposit/4')
      .send({ amount: 100 })
      .set('profile_id', '4')
      .expect('Content-Type', /json/)
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe(`Maximum deposit is ${maxDeposit}`);
      });
  });

  it('POST /balances/deposit/:userId deposit normal flow', async () => {
    const user = await Profile.findOne({ where: { id: 4 } });
    const initialBalance = user!.balance;
    return request(app)
      .post('/balances/deposit/4')
      .send({ amount: 50 })
      .set('profile_id', '4')
      .expect('Content-Type', /json/)
      .expect(200)
      .expect((res) => {
        expect(res.body.balance).toBe(initialBalance + 50);
      });
  });
});
