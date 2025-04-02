import { body, param } from 'express-validator';

export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('名前は必須です')
    .isLength({ max: 50 })
    .withMessage('名前は50文字以内で入力してください'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('メールアドレスは必須です')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('パスワードは必須です')
    .isLength({ min: 8 })
    .withMessage('パスワードは8文字以上で入力してください')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('パスワードは大文字、小文字、数字を含める必要があります')
];

export const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('メールアドレスは必須です')
    .isEmail()
    .withMessage('有効なメールアドレスを入力してください')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('パスワードは必須です')
];

export const approvalScreenshotValidation = [
  body('screenshot')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('スクリーンショットは必須です');
      }
      return true;
    })
];

export const approveUserValidation = [
  param('userId')
    .trim()
    .notEmpty()
    .withMessage('ユーザーIDは必須です')
    .isMongoId()
    .withMessage('無効なユーザーIDです')
]; 