import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  createdAt: Date;
}

const CategorySchema: Schema = new Schema({
  name: {
    type: String,
    required: [true, 'カテゴリー名を入力してください'],
    unique: true,
    trim: true,
    maxlength: [50, 'カテゴリー名は50文字以内で入力してください']
  },
  description: {
    type: String,
    required: [true, 'カテゴリーの説明を入力してください'],
    maxlength: [500, '説明は500文字以内で入力してください']
  },
  slug: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// スラッグの自動生成
CategorySchema.pre<ICategory>('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// インデックス
CategorySchema.index({ slug: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema); 