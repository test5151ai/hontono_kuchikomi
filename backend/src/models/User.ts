import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isApproved: boolean;
  role: 'user' | 'admin';
  approvalScreenshot?: string;
  createdAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
  getJwtToken(): string;
  getRefreshToken(): string;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '名前を入力してください'],
    maxlength: [50, '名前は50文字以内で入力してください']
  },
  email: {
    type: String,
    required: [true, 'メールアドレスを入力してください'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '有効なメールアドレスを入力してください'
    ]
  },
  password: {
    type: String,
    required: [true, 'パスワードを入力してください'],
    minlength: [6, 'パスワードは6文字以上で入力してください'],
    select: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalScreenshot: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// インデックスの設定
UserSchema.index({ email: 1 });
UserSchema.index({ isApproved: 1 });

// パスワードのハッシュ化
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// JWT トークンの生成
UserSchema.methods.getJwtToken = function(): string {
  const options = {
    expiresIn: process.env.JWT_EXPIRE || '30d',
    algorithm: 'HS256'
  } as any;
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET || 'secret',
    options
  );
};

// リフレッシュトークンの生成
UserSchema.methods.getRefreshToken = function(): string {
  const options = {
    expiresIn: '7d',
    algorithm: 'HS256'
  } as any;
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret',
    options
  );
};

// パスワードの一致確認
UserSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 