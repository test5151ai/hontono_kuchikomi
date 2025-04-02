import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain, ValidationError } from 'express-validator';
import ErrorResponse from '../utils/ErrorResponse';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // すべてのバリデーションを実行
    await Promise.all(validations.map(validation => validation.run(req)));

    // エラーの確認
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // エラーメッセージの整形
    const messages = errors.array().map((err: ValidationError) => err.msg);
    throw new ErrorResponse(messages.join(', '), 400);
  };
}; 