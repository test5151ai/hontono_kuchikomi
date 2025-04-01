import { Document, Types } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  isApproved: boolean;
  approvalScreenshot?: string;
  role: 'user' | 'admin';
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export type UserDocument = Document<unknown, any, IUser> & IUser & {
  _id: Types.ObjectId;
  __v: number;
}; 