import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUser, UserDocument, UserModel } from '../types/user';
import config from '../config/config';

const userSchema = new mongoose.Schema<IUser, UserModel, UserDocument>(
  {
    name: {
      type: String,
      required: [true, '名前を入力してください'],
      trim: true,
      maxlength: [50, '名前は50文字以内で入力してください'],
    },
    email: {
      type: String,
      required: [true, 'メールアドレスを入力してください'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, '有効なメールアドレスを入力してください'],
    },
    password: {
      type: String,
      required: [true, 'パスワードを入力してください'],
      minlength: [6, 'パスワードは6文字以上で入力してください'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    approvalScreenshot: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// パスワードのハッシュ化
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWTトークンの生成
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, config.jwt.secret, {
    expiresIn: config.jwt.expire,
  });
};

// パスワードの比較
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema); 