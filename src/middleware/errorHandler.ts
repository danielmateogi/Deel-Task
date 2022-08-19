import { DeelError } from '../utils'
import { NextFunction, Request, Response } from 'express'

export default (error: unknown, _req: Request, res: Response, _next: NextFunction): Response => {
  let code;
  let message;
  if (error instanceof DeelError) {
    code = error.code;
    message = error.message;
  } else {
    code = 500;
    message = 'Internal server error';
    /** We are only logging unexpected errors */
    console.error(`[${new Date().toISOString()}] ${error}`);
  }
  return res.status(code).json({ error: message })
}