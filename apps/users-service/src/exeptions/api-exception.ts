import { ValidationError } from 'express-validator/lib/base';

export class ApiException {
  constructor(
    public status: number,
    public message: string,
    public errors: ValidationError[] = []
  ) {}

  static unauthorizedError() {
    return new ApiException(401, 'Not Authorized');
  }

  static badRequestError(message: string, errors: ValidationError[] = []) {
    return new ApiException(400, message, errors);
  }
}
