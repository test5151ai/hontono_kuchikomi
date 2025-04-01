import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialInstitution extends Document {
  name: string;
  type: 'bank' | 'securities' | 'insurance' | 'credit_union' | 'other';
  description: string;
  location: string;
  website: string;
  logo: string;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
}

const FinancialInstitutionSchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, '金融機関名を入力してください'],
    trim: true,
    maxlength: [100, '金融機関名は100文字以内で入力してください']
  },
  type: {
    type: String,
    required: [true, '種類を選択してください'],
    enum: {
      values: ['bank', 'securities', 'insurance', 'credit_union', 'other'],
      message: '有効な金融機関種類を選択してください'
    }
  },
  description: {
    type: String,
    required: [true, '説明を入力してください'],
    maxlength: [1000, '説明は1000文字以内で入力してください']
  },
  location: {
    type: String,
    required: [true, '所在地を入力してください']
  },
  website: {
    type: String,
    match: [
      /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
      '有効なURLを入力してください'
    ]
  },
  logo: {
    type: String,
    default: 'no-photo.jpg'
  },
  avgRating: {
    type: Number,
    min: [1, '評価は最低1です'],
    max: [5, '評価は最高5です'],
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// レビューの仮想フィールドを設定
FinancialInstitutionSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'institution',
  justOne: false
});

export default mongoose.model<IFinancialInstitution>('FinancialInstitution', FinancialInstitutionSchema); 