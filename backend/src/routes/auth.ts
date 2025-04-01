import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { protect, requireAdmin } from '../middleware/auth';
import {
  register,
  login,
  logout,
  getCurrentUser,
  refreshToken,
  uploadApprovalScreenshot,
  getPendingUsers,
  approveUser
} from '../controllers/authController';

const router = express.Router();

// ストレージ設定
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, 'uploads/');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// ファイルタイプ検証
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// 認証ルート
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getCurrentUser);
router.post('/refresh-token', refreshToken);

// 承認関連ルート
router.post('/approval-screenshot', protect, upload.single('screenshot'), uploadApprovalScreenshot);
router.get('/pending-users', protect, requireAdmin, getPendingUsers);
router.put('/approve-user/:userId', protect, requireAdmin, approveUser);

export default router; 