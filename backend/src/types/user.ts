import { Document } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isApproved: boolean;
  approvalScreenshot?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends IUser, Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

export interface UserModel extends Document {
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
} 