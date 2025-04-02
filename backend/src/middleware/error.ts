import { Request, Response, NextFunction } from 'express';
import ErrorResponse from '../utils/ErrorResponse';
import { MongoError } from 'mongodb';
import mongoose from 'mongoose';

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
  code?: number;
  errors?: { [key: string]: any };
}

const errorHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // MongooseのObjectId形式エラー
  if (err.name === 'CastError') {
    const message = 'リソースが見つかりません';
    error = new ErrorResponse(message, 404);
  }

  // Mongooseの重複キーエラー
  if ((err as MongoError).code === 11000) {
    const message = '既に登録されている値です';
    error = new ErrorResponse(message, 400);
  }

  // Mongooseのバリデーションエラー
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map(val => (val as Error).message)
      .join(', ');
    error = new ErrorResponse(message, 400);
  }

  // JWT認証エラー
  if (err.name === 'JsonWebTokenError') {
    const message = '認証トークンが無効です';
    error = new ErrorResponse(message, 401);
  }

  // JWTの有効期限切れ
  if (err.name === 'TokenExpiredError') {
    const message = '認証トークンの有効期限が切れています';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'サーバーエラーが発生しました'
  });
};

export default errorHandler; 