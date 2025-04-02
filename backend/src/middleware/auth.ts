import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config/config';
import { UserDocument } from '../types/user';

interface CustomRequest extends Request {
  user?: UserDocument;
}

/**
 * リクエストのAuthorizationヘッダーまたはCookieからトークンを取得
 */
const getTokenFromRequest = (req: Request): string | null => {
  // Authorizationヘッダーからトークンを取得
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }

  // Cookieからトークンを取得
  if (req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

/**
 * 認証が必要なルートを保護するミドルウェア
 */
export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: '認証が必要です'
      });
      return;
    }

    try {
      // トークンの検証
      const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

      // ユーザーの取得
      const user = await User.findById(decoded.id);
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'ユーザーが見つかりません'
        });
        return;
      }

      // リクエストオブジェクトにユーザー情報を追加
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'トークンが無効です'
      });
      return;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * 管理者権限が必要なルートを保護するミドルウェア
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: '管理者権限が必要です'
    });
    return;
  }
  next();
};

// 特定のロールを持つユーザーのみアクセス可能にする
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // ユーザーのロールを確認
    if (!roles.includes((req as any).user.role)) {
      return res.status(403).json({
        success: false,
        error: `${(req as any).user.role} ロールはこの操作を実行する権限がありません`
      });
    }
    next();
  };
}; 