import { Job, Contract, Profile } from '../model';
import { requestWrapper, sqliteConcatColumns } from '../utils';

import express from 'express';
import sequelize, { Op } from 'sequelize';
import Joi from 'joi';

const router = express.Router();

export interface BestClient {
  id: number;
  fullName: string;
  paid: number;
}

export interface BestProfession {
  profession: string;
  total: number;
}


router.get(
  '/best-clients',
  requestWrapper(async (req): Promise<BestClient[]> => {
    const { start, end, limit = 2 } = req.query;

    const schema = Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().required(),
      limit: Joi.number().integer().min(1).max(100),
    });

    await schema.validateAsync({ start, end, limit });
    
    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    return Job.findAll({
      /**
       *  Returning raw provides some performance improvements for big limits especially
       *  because we don't need to create objects for each row
       */
      raw: true,
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'paid'],
        [
          /**
           *  SQLite specific implementation, it doesn't have the CONCAT function so we do it like this
           *  Alternatively, it can be done after the query is made with a .map() function instead of a platform
           *  specific implementation (although it would not be as performant)
           */
          sqliteConcatColumns('Contract->Client', ['firstName', 'lastName']),
          'fullName',
        ],
        [sequelize.col('Contract.Client.id'), 'id'],
      ],
      order: [sequelize.literal('paid DESC')],
      group: [sequelize.col('Contract.ClientId')],
      limit: +limit,
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: 'Client',
              attributes: [],
            },
          ],
        },
      ],
    }) as unknown as Promise<BestClient[]>;
  })
);

router.get(
  '/best-profession',
  requestWrapper(async (req): Promise<BestProfession> => {
    const { start, end } = req.query;
    
    const schema = Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().required(),
    });

    await schema.validateAsync({ start, end });

    const startDate = new Date(start as string);
    const endDate = new Date(end as string);

    return Job.findOne({
      raw: true,
      attributes: [
        [sequelize.fn('SUM', sequelize.col('price')), 'total'],
        [sequelize.col('Contract.Contractor.profession'), 'profession'],
      ],
      order: [sequelize.literal('total DESC')],
      group: [sequelize.col('Contract.Contractor.profession')],
      where: {
        paid: true,
        paymentDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Contract,
          attributes: [],
          include: [
            {
              model: Profile,
              as: 'Contractor',
              attributes: [],
            },
          ],
        },
      ],
    }) as unknown as Promise<BestProfession>;
  })
);

export default router;
