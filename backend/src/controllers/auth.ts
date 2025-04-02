import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { UserDocument } from '../types/user';
import ErrorResponse from '../utils/ErrorResponse';

/**
 * @desc    ユーザー登録
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // メールアドレスの重複チェック
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ErrorResponse('このメールアドレスは既に登録されています', 400);
    }

    // ユーザーの作成
    const user = await User.create({
      name,
      email,
      password
    });

    // JWTトークンの生成と送信
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    ログイン
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // メールアドレスとパスワードのチェック
    if (!email || !password) {
      throw new ErrorResponse('メールアドレスとパスワードを入力してください', 400);
    }

    // ユーザーの検索（パスワードフィールドを含める）
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new ErrorResponse('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // パスワードの照合
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('メールアドレスまたはパスワードが正しくありません', 401);
    }

    // 承認状態のチェック
    if (!user.isApproved) {
      throw new ErrorResponse('アカウントがまだ承認されていません', 403);
    }

    // JWTトークンの生成と送信
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    ログアウト
 * @route   GET /api/auth/logout
 * @access  Private
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Cookieからトークンを削除
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000), // 10秒後に期限切れ
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'ログアウトしました'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    現在のユーザー情報を取得
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new ErrorResponse('ユーザーが見つかりません', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    承認用スクリーンショットのアップロード
 * @route   POST /api/auth/approval-screenshot
 * @access  Private
 */
export const uploadApprovalScreenshot = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new ErrorResponse('ユーザーが見つかりません', 404);
    }

    // スクリーンショットのパスを保存
    user.approvalScreenshot = req.file?.path;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'スクリーンショットがアップロードされました',
      data: {
        approvalScreenshot: user.approvalScreenshot
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    承認待ちユーザーの一覧を取得
 * @route   GET /api/auth/pending-users
 * @access  Private/Admin
 */
export const getPendingUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find({
      isApproved: false,
      approvalScreenshot: { $exists: true, $ne: null }
    }).select('name email approvalScreenshot createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    ユーザーを承認
 * @route   PUT /api/auth/approve-user/:userId
 * @access  Private/Admin
 */
export const approveUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      throw new ErrorResponse('ユーザーが見つかりません', 404);
    }

    // 既に承認済みの場合
    if (user.isApproved) {
      throw new ErrorResponse('このユーザーは既に承認されています', 400);
    }

    // 承認スクリーンショットがない場合
    if (!user.approvalScreenshot) {
      throw new ErrorResponse('承認用スクリーンショットがアップロードされていません', 400);
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'ユーザーが承認されました',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * トークンの生成とレスポンスの送信
 */
const sendTokenResponse = (
  user: UserDocument,
  statusCode: number,
  res: Response
): void => {
  // トークンの生成
  const token = user.getSignedJwtToken();

  // Cookie オプションの設定
  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30日
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
}; 