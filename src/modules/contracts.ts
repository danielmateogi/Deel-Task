import getProfile from '../middleware/getProfile';
import { Contract, Job, Profile } from '../model';
import { whereProfileId, requestWrapper, DeelError } from '../utils';

import express from 'express';
import Joi from 'joi';

const router = express.Router();

router.use(getProfile);

router.get(
  '/:id',
  requestWrapper(async (req) => {
    const { id } = req.params;
    const schema = Joi.object({
      id: Joi.number().min(1).required(),
    });
    await schema.validateAsync({ id });
    const contract = await Contract.findOne({ where: { id, ...whereProfileId(req.profile) } });
    if (!contract) throw new DeelError('Contract not found', 404);
    return contract;
  })
);

router.get(
  '/',
  requestWrapper(async (req) => {
    /**
     * If we are a client we want to get the profile of the contractor for displaying in the frontend
     * and vice versa.
     */
    const modelToInclude = req.profile.type === 'client' ? 'Contractor' : 'Client';
    const contracts = await Contract.findAll({
      where: {
        ...whereProfileId(req.profile),
        status: ['new', 'in_progress'],
      },
      /** We return job payment status to show completion progress in frontend */
      include: [
        { model: Profile, as: modelToInclude },
        { model: Job, attributes: ['id', 'paid'] },
      ],
    });
    return contracts;
  })
);

export default router;
