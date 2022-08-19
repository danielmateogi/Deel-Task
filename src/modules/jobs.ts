import getProfile from '../middleware/getProfile';
import { Job, Contract, Profile, sequelize } from '../model';
import { whereProfileId, requestWrapper, DeelError } from '../utils';

import express from 'express';
import Joi from 'joi';

const router = express.Router();

router.use(getProfile);


router.get(
  '/unpaid',
  requestWrapper(async (req) => {
    return Job.findAll({
      /**
       * Since paymentDate: null is basically the same as paid: false (from what I understood),
       * then we can take advantage of the index on paymentDate to get all unpaid jobs faster.
       * The index is especially useful for the /admin routes because we sort the dates.
       */
      where: {
        paymentDate: null,
      },
      include: [
        {
          model: Contract,
          /** We get these attributes for displaying in the frontend */
          attributes: ['ContractorId', 'ClientId'],
          where: {
            /** Get only active contracts */
            status: 'in_progress',
            ...whereProfileId(req.profile),
          },
        },
      ],
    });
  })
);

router.post(
  '/:jobId/pay',
  requestWrapper(async (req) => {
    if (req.profile.type !== 'client') {
      throw new DeelError('Only clients can pay for jobs', 403);
    }

    const { jobId } = req.params;
    const schema = Joi.object({
      jobId: Joi.number().min(1).required(),
    });
    await schema.validateAsync({ jobId });

    /**
     * Default transaction isolation level for SQLite is SERIALIZABLE, so no need to set it manually or
     * to set row locks
     */
    const transactionResult = await sequelize.transaction(async (transaction) => {
      /** We get the job in the transaction so the price doesn't change while performing the updates */
      const job = await Job.findOne({
        where: { id: jobId },
        attributes: ['price', 'paid', 'id'],
        include: [
          {
            model: Contract,
            where: {
              ...whereProfileId(req.profile),
            },
            attributes: ['id'],
            include: [
              {
                model: Profile,
                attributes: ['id'],
                as: 'Contractor',
              },
              {
                model: Profile,
                attributes: ['balance', 'id'],
                as: 'Client',
              },
            ],
          },
        ],
        transaction,
      });

      if (!job) throw new DeelError('Job not found', 404);

      /**
       *  We return error if job already paid instead of filtering in the query
       *  because it makes for better UX
       */
      if (job.paid) throw new DeelError('Job already paid', 400);

      // Null assertions are needed because typescript can't know if we included the models or not
      // See https://sequelize.org/docs/v6/other-topics/typescript/#usage for more info
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { Contractor: contractor, Client: client } = job.Contract!;

      /** Those errors shouldn't have to be thrown but it's a sanity check */
      if (!contractor) throw new DeelError('Contractor not found', 404);
      if (!client) throw new DeelError('Client not found', 404);

      if (client.balance < job.price) {
        throw new DeelError('Balance is too low to pay for the job', 400);
      }

      const updateJobPromise = job.update(
        {
          paid: true,
          paymentDate: new Date().toISOString(),
        },
        { transaction }
      );

      /** After increment/decrement we need to perform a reload on the model instances to get the updated values */
      const updateContractorPromise = contractor
        .increment('balance', { by: job.price, transaction })
        .then((contractor) => contractor.reload({ transaction }));

      const updateClientPromise = client
        .decrement('balance', { by: job.price, transaction })
        .then((client) => client.reload({ transaction }));

      await Promise.all([updateJobPromise, updateContractorPromise, updateClientPromise]);

      return {
        job,
        contractor,
        client,
      };
    });

    return transactionResult;
  })
);

export default router;
