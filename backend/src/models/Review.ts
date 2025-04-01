import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  title: string;
  text: string;
  rating: number;
  user: mongoose.Schema.Types.ObjectId;
  institution: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'タイトルを入力してください'],
    trim: true,
    maxlength: [100, 'タイトルは100文字以内で入力してください']
  },
  text: {
    type: String,
    required: [true, 'レビュー内容を入力してください'],
    maxlength: [1000, 'レビューは1000文字以内で入力してください']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, '1から5の間で評価してください']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FinancialInstitution',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ユーザーごとに1つの金融機関に対して1つのレビューのみ許可
ReviewSchema.index({ institution: 1, user: 1 }, { unique: true });

// 金融機関の平均評価を更新するスタティックメソッド
ReviewSchema.statics.getAverageRating = async function(institutionId) {
  const obj = await this.aggregate([
    {
      $match: { institution: institutionId }
    },
    {
      $group: {
        _id: '$institution',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj[0]) {
      await mongoose.model('FinancialInstitution').findByIdAndUpdate(institutionId, {
        avgRating: obj[0].avgRating.toFixed(1),
        reviewCount: obj[0].reviewCount
      });
    } else {
      await mongoose.model('FinancialInstitution').findByIdAndUpdate(institutionId, {
        avgRating: 0,
        reviewCount: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

// レビュー保存後に統計を計算
ReviewSchema.post('save', function() {
  // @ts-ignore
  this.constructor.getAverageRating(this.institution);
});

// レビュー削除後に統計を更新
ReviewSchema.post('remove', function() {
  // @ts-ignore
  this.constructor.getAverageRating(this.institution);
});

export default mongoose.model<IReview>('Review', ReviewSchema); 