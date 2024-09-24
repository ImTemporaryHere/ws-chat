import { NextFunction, Request, Response } from 'express';
import { ApiException } from '../exeptions/api-exception';

export const errorMiddleware = function (
  errorObject: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log(errorObject);

  if (errorObject instanceof ApiException) {
    return res
      .status(errorObject.status)
      .json({ message: errorObject.message, errors: errorObject.errors });
  }

  return res.status(500).json({ message: 'unexpected error' });
};
