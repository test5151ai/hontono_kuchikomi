import mongoose, { Document, Schema } from 'mongoose';

export interface IHelpful extends Document {
  user: mongoose.Schema.Types.ObjectId;
  comment: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const HelpfulSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// コメントの「参考になった」カウントを更新するスタティックメソッド
HelpfulSchema.statics.updateHelpfulCount = async function(commentId) {
  const Comment = mongoose.model('Comment');
  const count = await this.countDocuments({ comment: commentId });
  
  await Comment.findByIdAndUpdate(commentId, {
    helpfulCount: count
  });
};

// 「参考になった」追加後にコメントのカウントを更新
HelpfulSchema.post('save', async function() {
  // @ts-ignore
  await this.constructor.updateHelpfulCount(this.comment);
});

// 「参考になった」削除後にコメントのカウントを更新
HelpfulSchema.post('deleteOne', { document: true, query: false }, async function() {
  // @ts-ignore
  await this.constructor.updateHelpfulCount(this.comment);
});

// 同じユーザーが同じコメントに複数回「参考になった」を付けられないようにする
HelpfulSchema.index({ user: 1, comment: 1 }, { unique: true });

export default mongoose.model<IHelpful>('Helpful', HelpfulSchema); 