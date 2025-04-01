import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  thread: mongoose.Schema.Types.ObjectId;
  helpfulCount: number;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  content: {
    type: String,
    required: [true, 'コメント内容を入力してください'],
    maxlength: [1000, 'コメントは1000文字以内で入力してください']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Thread',
    required: true
  },
  helpfulCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// スレッドのコメント数を更新するスタティックメソッド
CommentSchema.statics.updateCommentCount = async function(threadId) {
  const Thread = mongoose.model('Thread');
  const count = await this.countDocuments({ thread: threadId });
  
  await Thread.findByIdAndUpdate(threadId, {
    commentCount: count
  });
};

// コメント追加後にスレッドのコメント数を更新
CommentSchema.post('save', async function() {
  // @ts-ignore
  await this.constructor.updateCommentCount(this.thread);
});

// コメント削除後にスレッドのコメント数を更新
CommentSchema.post('deleteOne', { document: true, query: false }, async function() {
  // @ts-ignore
  await this.constructor.updateCommentCount(this.thread);
});

// インデックス
CommentSchema.index({ thread: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ helpfulCount: -1 });
CommentSchema.index({ content: 'text' });

export default mongoose.model<IComment>('Comment', CommentSchema); 