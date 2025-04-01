# セキュリティ設計と実装ガイドライン

このドキュメントでは、金融機関口コミサイト「本当の口コミ」のセキュリティ設計と実装ガイドラインについて説明します。

## 1. 認証・認可セキュリティ

### JWT認証セキュリティ

```typescript
// JWTトークン生成時の安全な実装
export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET as string,
    { 
      expiresIn: process.env.JWT_EXPIRE || '30d',
      algorithm: 'HS256'  // アルゴリズムを明示的に指定
    }
  );
};

// リフレッシュトークン実装
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET as string,
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};
```

### セキュアなクッキー設定

```typescript
// セキュアなクッキー設定
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
  const token = user.getJwtToken();
  const refreshToken = generateRefreshToken(user._id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24時間
    httpOnly: true,           // JavaScriptからアクセス不可
    secure: process.env.NODE_ENV === 'production', // HTTPS接続時のみ
    sameSite: 'strict' as const // CSRF対策
  };
  
  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日間
    })
    .json({
      success: true,
      token
    });
};
```

### 認可ミドルウェア

```typescript
// 認証ミドルウェア - ユーザーが認証済みかチェック
export const protect: RequestHandler = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: '認証が必要です'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'ユーザーが存在しません'
      });
    }
    
    (req as any).user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'トークンが無効です'
    });
  }
};

// 承認済みユーザーのみアクセス可能なミドルウェア
export const requireApproved: RequestHandler = (req, res, next) => {
  if (!(req as any).user.isApproved && (req as any).user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'このリソースにアクセスするには承認が必要です'
    });
  }
  next();
};

// 管理者のみアクセス可能なミドルウェア
export const requireAdmin: RequestHandler = (req, res, next) => {
  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: '管理者のみアクセス可能です'
    });
  }
  next();
};
```

## 2. 入力検証とサニタイゼーション

### バリデーションミドルウェア

```typescript
import { body, validationResult } from 'express-validator';

// ユーザー登録のバリデーション
export const validateRegisterInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('名前を入力してください')
    .isLength({ max: 50 }).withMessage('名前は50文字以内で入力してください'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('メールアドレスを入力してください')
    .isEmail().withMessage('有効なメールアドレスを入力してください'),
  
  body('password')
    .trim()
    .notEmpty().withMessage('パスワードを入力してください')
    .isLength({ min: 6 }).withMessage('パスワードは6文字以上で入力してください')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('パスワードには大文字、小文字、数字を含めてください'),
  
  // バリデーション結果の確認
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// コメント投稿のバリデーション
export const validateCommentInput = [
  body('content')
    .trim()
    .notEmpty().withMessage('コメント内容を入力してください')
    .isLength({ max: 1000 }).withMessage('コメントは1000文字以内で入力してください')
    .escape(), // XSS対策のためのHTMLエスケープ
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
```

### コンテンツサニタイズ

```typescript
import sanitizeHtml from 'sanitize-html';

// HTMLサニタイズ設定
const sanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes: {
    'a': ['href', 'target']
  },
  allowedIframeHostnames: []
};

// コンテンツを安全にサニタイズするミドルウェア
export const sanitizeContent: RequestHandler = (req, res, next) => {
  if (req.body.content) {
    req.body.content = sanitizeHtml(req.body.content, sanitizeOptions);
  }
  next();
};
```

## 3. レート制限

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Redis接続（オプション）
const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

// API全体のレート制限
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // IPごとに15分間で最大100リクエスト
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'リクエスト数が多すぎます。しばらくしてからお試しください。'
  },
  // Redis接続がある場合はRedisStoreを使用
  ...(process.env.REDIS_HOST && {
    store: new RedisStore({
      sendCommand: (...args: unknown[]) => redisClient.call(...args)
    })
  })
});

// ログイン試行のレート制限（より厳しい制限）
export const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 5, // IPごとに1時間で最大5回のログイン試行
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'ログイン試行回数が多すぎます。1時間後に再度お試しください。'
  },
  ...(process.env.REDIS_HOST && {
    store: new RedisStore({
      sendCommand: (...args: unknown[]) => redisClient.call(...args)
    })
  })
});
```

## 4. CSRF保護

```typescript
import csurf from 'csurf';

// CSRF保護ミドルウェアの設定
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRFトークンを提供するエンドポイント
export const getCsrfToken: RequestHandler = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};

// クライアント側での使用例
// フォーム送信前にCSRFトークンを取得して送信データに含める
async function submitWithCsrfToken(data) {
  // まずCSRFトークンを取得
  const csrfResponse = await fetch('/api/csrf-token');
  const { csrfToken } = await csrfResponse.json();
  
  // データ送信時にトークンを含める
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CSRF-Token': csrfToken
    },
    body: JSON.stringify(data),
    credentials: 'include' // クッキーを送信するために必要
  });
  
  return response.json();
}
```

## 5. ファイルアップロードセキュリティ

```typescript
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// ストレージ設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// ファイルタイプ検証
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 許可するMIMEタイプ
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイルタイプです。JPEG、PNG、GIF形式のみアップロード可能です。'));
  }
};

// アップロード設定
export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 最大2MB
  }
});

// スクリーンショットアップロードミドルウェア
export const uploadScreenshot = uploadConfig.single('screenshot');

// アップロードエラーハンドリングミドルウェア
export const handleUploadError: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'ファイルサイズは2MB以下にしてください。'
      });
    }
  }
  
  if (err.message.includes('ファイルタイプ')) {
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  
  next(err);
};
```

## 6. セキュリティヘッダー設定

```typescript
import helmet from 'helmet';

// セキュリティヘッダーの設定
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:', 'cdn.jsdelivr.net'],
      connectSrc: ["'self'", 'api.example.com'],
      fontSrc: ["'self'", 'cdn.jsdelivr.net'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  xssFilter: true,
  noSniff: true,
  referrerPolicy: { policy: 'same-origin' }
});
```

## 7. ログ記録と監視

```typescript
import winston from 'winston';
import morgan from 'morgan';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// ロガーの設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// 開発環境ではコンソールにも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// セキュリティイベントログ記録ミドルウェア
export const securityLogger: RequestHandler = (req, res, next) => {
  // ログイン試行やセキュリティ関連操作を記録
  if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
    logger.info({
      type: 'security',
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  }
  next();
};

// アクセスログミドルウェア
export const accessLogger = morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
});

// エラーログミドルウェア
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  });
  next(err);
};
```

## 8. セキュリティベストプラクティス

1. **環境変数の安全な管理**
   - `.env`ファイルをgitリポジトリに含めない（`.gitignore`に追加）
   - 本番環境のシークレットは安全な環境変数管理システムを使用

2. **依存関係の管理**
   - 定期的に`npm audit`を実行して脆弱性をチェック
   - 常に最新の安全なバージョンを使用

3. **エラーメッセージの適切な処理**
   - 本番環境では詳細なエラー情報をユーザーに表示しない
   - 一般的なエラーメッセージを返し、詳細はログに記録

4. **HTTPSの強制**
   - 本番環境では常にHTTPSを使用
   - HTTP Strict Transport Security (HSTS)の設定

5. **データの暗号化**
   - 機密データ（個人情報など）はデータベースに保存する前に暗号化

6. **定期的なセキュリティ監査**
   - コードレビューでセキュリティの観点からも確認
   - 定期的な脆弱性スキャンの実施 