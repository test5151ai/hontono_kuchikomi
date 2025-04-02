import express from 'express';
import {
  register,
  login,
  logout,
  getMe
} from '../controllers/auth';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerValidation, loginValidation } from '../validations/auth';

const router = express.Router();

// パブリックルート
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);

// プライベートルート（認証が必要）
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

/* 承認機能は後で実装
// ファイルアップロード設定
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('許可されていないファイルタイプです。JPEG、PNG、GIF形式のみアップロード可能です。'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 最大2MB
  }
});

// 承認関連ルート
router.post('/approval-screenshot', protect, upload.single('screenshot'), uploadApprovalScreenshot);
router.get('/pending-users', protect, requireAdmin, getPendingUsers);
router.put('/approve-user/:userId', protect, requireAdmin, approveUser);
*/

export default router; 