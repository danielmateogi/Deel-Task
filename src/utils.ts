import { Profile, sequelize } from './model';
import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

export class DeelError extends Error {
  public code: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code ?? 500;
    this.name = 'DeelError';
  }
}

export const whereProfileId = (profile: Profile) => {
  return {
    [profile.type === 'client' ? 'ClientId' : 'ContractorId']: profile.id as number,
  };
};

export const requestWrapper = (callback: (req: Request, Response: Response) => Promise<unknown>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await callback(req, res);
      return res.json(result);
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        /** If we have validation errors return the message from Joi */
        return next(new DeelError(error.message, 400));
      }
      return next(error);
    }
  };
};

export const sqliteConcatColumns = (table: string, columns: string[]) => {
  const args = columns.map((column) => `"${table}"."${column}"`);
  return sequelize.literal(args.join(' || " " || '));
};
