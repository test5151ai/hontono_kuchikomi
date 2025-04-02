import express, { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  register,
  login,
  logout,
  getMe,
  uploadApprovalScreenshot,
  getPendingUsers,
  approveUser
} from '../controllers/auth';
import { protect, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerValidation,
  loginValidation,
  approvalScreenshotValidation,
  approveUserValidation
} from '../validations/auth';

const router = express.Router();

// ストレージ設定
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, 'uploads/');
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// ファイルタイプ検証
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイルタイプです。JPEG、PNG、GIF形式のみアップロード可能です。'));
  }
};

// アップロード設定
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 最大2MB
  }
});

// パブリックルート
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// プライベートルート（認証が必要）
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

// 承認関連ルート
router.post(
  '/approval-screenshot',
  protect,
  upload.single('screenshot'),
  validate(approvalScreenshotValidation),
  uploadApprovalScreenshot
);
router.get('/pending-users', protect, requireAdmin, getPendingUsers);
router.put(
  '/approve-user/:userId',
  protect,
  requireAdmin,
  validate(approveUserValidation),
  approveUser
);

export default router; 