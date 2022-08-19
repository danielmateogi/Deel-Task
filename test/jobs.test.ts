/* eslint-disable @typescript-eslint/no-non-null-assertion */
import app from '../src/app';
import request from 'supertest';
import { Contract, Job, Profile } from '../src/model';

describe('Job module testing', () => {
  test('GET /jobs/unpaid', async () => {
    return request(app)
      .get('/jobs/unpaid')
      .set('profile_id', '2')
      .expect(200)
      .expect(async (res) => {
        expect(res.body[0]).toHaveProperty('paid');
        const paidStatuses = res.body.map((job: Job) => job.paid);
        expect(paidStatuses).not.toContain(true);
        expect(res.body[0]).toHaveProperty('Contract');
        const contractIds = res.body.map((job: Job) => job.ContractId);
        /** We need to get the contracts because we don't have status in the response */
        const contracts = await Contract.findAll({
          where: {
            id: contractIds,
          },
        });
        const allContractStatuses = contracts.map((contract) => contract.status);
        /** Active contracts are only the ones in progress */
        allContractStatuses.forEach((status) => {
          expect(status).toBe('in_progress');
        });
      });
  });

  it('POST /jobs/:jobId/pay fail for already paid job', async () => {
    return request(app)
      .post('/jobs/8/pay')
      .set('profile_id', '2')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Job already paid');
      });
  });

  it('POST /jobs/:jobId/pay fail for non-existing job', async () => {
    return request(app)
      .post('/jobs/100/pay')
      .set('profile_id', '1')
      .expect(404)
      .expect((res) => {
        expect(res.body.error).toBe('Job not found');
      });
  });

  it('POST /jobs/:jobId/pay fail when user is contractor', async () => {
    return request(app)
      .post('/jobs/4/pay')
      .set('profile_id', '6')
      .expect(403)
      .expect((res) => {
        expect(res.body.error).toBe('Only clients can pay for jobs');
      });
  });

  it('POST /jobs/:jobId/pay normal flow', async () => {
    const job = await Job.findOne({
      where: { id: 2 },
      include: [
        {
          model: Contract,
          include: [
            {
              model: Profile,
              as: 'Contractor',
            },
            {
              model: Profile,
              as: 'Client',
            },
          ],
        },
      ],
    });
    const clientBalanceBefore = job!.Contract!.Client!.balance;
    const contractorBalanceBefore = job!.Contract!.Contractor!.balance;

    return request(app)
      .post('/jobs/2/pay')
      .set('profile_id', '1')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('job');
        expect(res.body).toHaveProperty('contractor');
        expect(res.body).toHaveProperty('client');
        expect(res.body.job.paid).toBe(true);
        expect(res.body.contractor.balance).toBe(contractorBalanceBefore + job!.price);
        expect(res.body.client.balance).toBe(clientBalanceBefore - job!.price);
      });
  });

  it('POST /jobs/:jobId/pay fail when balance is not enough', async () => {
    return request(app)
      .post('/jobs/5/pay')
      .set('profile_id', '4')
      .expect(400)
      .expect((res) => {
        expect(res.body.error).toBe('Balance is too low to pay for the job');
      });
  });
});
