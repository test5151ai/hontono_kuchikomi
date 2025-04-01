import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { IUser } from '../types/user';

interface CustomRequest extends Request {
  user?: IUser;
}

// 認証ミドルウェア
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: '認証が必要です'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'ユーザーが存在しません'
      });
      return;
    }
    
    (req as CustomRequest).user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'トークンが無効です'
    });
  }
};

// 管理者権限チェックミドルウェア
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as CustomRequest).user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: '管理者のみアクセス可能です'
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