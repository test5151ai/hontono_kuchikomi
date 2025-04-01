import mongoose, { Document, Schema } from 'mongoose';

export interface IThread extends Document {
  title: string;
  author: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ThreadSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'タイトルを入力してください'],
    trim: true,
    maxlength: [200, 'タイトルは200文字以内で入力してください']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  commentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// コメントの仮想フィールド
ThreadSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'thread',
  justOne: false
});

// 更新日時の自動更新
ThreadSchema.pre<IThread>('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// インデックス
ThreadSchema.index({ category: 1 });
ThreadSchema.index({ author: 1 });
ThreadSchema.index({ createdAt: -1 });
ThreadSchema.index({ commentCount: -1 });
ThreadSchema.index({ title: 'text' });

export default mongoose.model<IThread>('Thread', ThreadSchema); 