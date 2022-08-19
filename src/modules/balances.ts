import getProfile from '../middleware/getProfile';
import { Contract, Job, Profile, sequelize } from '../model';
import { requestWrapper, DeelError } from '../utils';

import express from 'express';
import Joi from 'joi';

const router = express.Router();

router.use(getProfile);

export type UnpaidJobsTotal = {
  total: number;
};

export const getUnpaidJobsTotal = (userId: number): UnpaidJobsTotal =>
  // We use findOne instead of findAll to not have to access the first element of the array
  Job.findOne({
    where: {
      paid: false,
    },
    // Using raw to make the result easier to parse (no need for .dataValues)
    raw: true,
    attributes: [[sequelize.fn('sum', sequelize.col('price')), 'total']],
    include: [
      {
        model: Contract,
        attributes: [],
        where: {
          ClientId: userId,
          /** If I understood correctly, we need to check here as well if the contract is active */
          status: 'in_progress',
        },
      },
    ],
  }) as unknown as UnpaidJobsTotal;

/**
 * I think userId is redundant here since we already check for the profile,
 * but I am still using it since it was included in the requirements.
 */
router.post(
  '/deposit/:userId',
  requestWrapper(async (req) => {
    const { amount } = req.body;
    const { userId } = req.params;

    if (!amount) throw new DeelError('Amount is required', 400);

    const schema = Joi.object({
      amount: Joi.number().min(1).required(),
      userId: Joi.number().min(1).required(),
    });

    await schema.validateAsync({ amount, userId });

    const user = await Profile.findOne({ where: { id: userId }, attributes: ['type', 'id'] });

    if (!user) throw new DeelError('User not found', 404);
    if (user.type !== 'client') throw new DeelError('Only clients can deposit money', 403);

    const unpaidJobsResult = await getUnpaidJobsTotal(user.id);

    if (!unpaidJobsResult || unpaidJobsResult.total === null) {
      throw new DeelError('No unpaid jobs found', 404);
    }

    const maxDeposit = Math.floor(0.25 * unpaidJobsResult.total);
    if (amount > maxDeposit) throw new DeelError(`Maximum deposit is ${maxDeposit}`, 400);

    await user.increment('balance', { by: amount }).then((user) => user.reload());
    return { balance: user.balance };
  })
);

/**
 * This is created to be used on the frontend to show the maximum amount in the range slider.
 */
router.get(
  '/deposit/max',
  requestWrapper(async (req) => {
    if (req.profile.type !== 'client') {
      throw new DeelError('Only clients can deposit money', 403);
    }

    const unpaidJobsResult = await getUnpaidJobsTotal(req.profile.id);

    if (!unpaidJobsResult || unpaidJobsResult.total === null) {
      throw new DeelError('No unpaid jobs found', 404);
    }

    const maxDeposit = Math.floor(0.25 * unpaidJobsResult.total);
    return { maxDeposit };
  })
);

export default router;
