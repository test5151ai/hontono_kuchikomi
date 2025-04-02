import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { IUser, UserDocument } from '../types/user';
import config from '../config/config';

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: [true, '名前は必須です'],
      trim: true,
      maxlength: [50, '名前は50文字以内で入力してください']
    },
    email: {
      type: String,
      required: [true, 'メールアドレスは必須です'],
      unique: true,
      match: [
        /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        '有効なメールアドレスを入力してください'
      ]
    },
    password: {
      type: String,
      required: [true, 'パスワードは必須です'],
      minlength: [8, 'パスワードは8文字以上で入力してください'],
      select: false // デフォルトでパスワードを取得しない
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvalScreenshot: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// パスワードの暗号化
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// パスワードの照合
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JWTトークンの生成
UserSchema.methods.getSignedJwtToken = function(): string {
  const signOptions: SignOptions = {
    expiresIn: config.jwt.expire as jwt.SignOptions['expiresIn']
  };
  return jwt.sign(
    { id: this._id },
    config.jwt.secret as Secret,
    signOptions
  );
};

// メールアドレスの重複チェック用のインデックス
UserSchema.index({ email: 1 }, { unique: true });

export default mongoose.model<UserDocument>('User', UserSchema); 