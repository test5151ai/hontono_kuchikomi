import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser, UserDocument } from '../types/user';
import { JwtPayload } from 'jsonwebtoken';
import { Document } from 'mongoose';

// カスタムリクエスト型
interface CustomRequest extends Request {
  user?: UserDocument;
}

interface FileUploadRequest extends CustomRequest {
  file?: Express.Multer.File;
}

// JWTトークン生成
const generateToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: 30 * 24 * 60 * 60, // 30日を秒数で指定
    algorithm: 'HS256'
  };
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'secret',
    options
  );
};

// リフレッシュトークン生成
const generateRefreshToken = (userId: string): string => {
  const options: SignOptions = {
    expiresIn: 7 * 24 * 60 * 60, // 7日を秒数で指定
    algorithm: 'HS256'
  };
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    options
  );
};

// トークンレスポンス送信
const sendTokenResponse = (user: UserDocument, statusCode: number, res: Response) => {
  const token = generateToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const
  };
  
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
    .json({
      success: true,
      token
    });
};

// ユーザー登録
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // ユーザーが既に存在するかチェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'このメールアドレスは既に登録されています'
      });
      return;
    }

    // 新規ユーザー作成
    const user = await User.create({
      name,
      email,
      password
    });

    // トークン生成とレスポンス送信
    sendTokenResponse(user as UserDocument, 201, res);
  } catch (error: unknown) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'ユーザー登録に失敗しました'
    });
  }
};

// ログイン
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // メールアドレスとパスワードの検証
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'メールアドレスとパスワードを入力してください'
      });
      return;
    }

    // ユーザー検索
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
      return;
    }

    // パスワード検証
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'メールアドレスまたはパスワードが正しくありません'
      });
      return;
    }

    // トークン生成とレスポンス送信
    sendTokenResponse(user as UserDocument, 200, res);
  } catch (error: unknown) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'ログインに失敗しました'
    });
  }
};

// ログアウト
export const logout = (req: Request, res: Response): void => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// 現在のユーザー情報取得
export const getCurrentUser = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ユーザー情報の取得に失敗しました'
    });
  }
};

// リフレッシュトークン
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: 'リフレッシュトークンが見つかりません'
      });
      return;
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
      return;
    }

    sendTokenResponse(user as UserDocument, 200, res);
  } catch (error: unknown) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'リフレッシュトークンが無効です'
    });
  }
};

// 承認用スクリーンショットのアップロード
export const uploadApprovalScreenshot = async (req: FileUploadRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'ファイルがアップロードされていません'
      });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
      return;
    }

    user.approvalScreenshot = req.file.path;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'スクリーンショットのアップロードに失敗しました'
    });
  }
};

// 承認待ちユーザー一覧取得
export const getPendingUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({
      isApproved: false,
      approvalScreenshot: { $exists: true }
    }).select('-password');

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ユーザー一覧の取得に失敗しました'
    });
  }
};

// ユーザー承認
export const approveUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'ユーザーが見つかりません'
      });
      return;
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ユーザー承認に失敗しました'
    });
  }
}; 