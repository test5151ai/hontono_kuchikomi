# データモデル設計

本ドキュメントでは、金融機関口コミサイト「本当の口コミ」のMongoDBデータモデル設計について説明します。

## 1. ユーザーモデル (User)

ユーザー認証と権限管理を担当するモデルです。

```typescript
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  isApproved: boolean;
  role: 'user' | 'admin';
  approvalScreenshot: string;
  createdAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  getJwtToken(): string;
}

const UserSchema = new Schema({
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
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  approvalScreenshot: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// インデックス
UserSchema.index({ email: 1 });
UserSchema.index({ isApproved: 1 });
```

### 機能
- パスワードハッシュ化（bcrypt）
- JSONウェブトークン（JWT）の生成
- パスワード比較機能

## 2. カテゴリーモデル (Category)

金融機関のカテゴリー情報を管理するモデルです。

```typescript
interface ICategory extends Document {
  name: string;
  description: string;
  slug: string;
  createdAt: Date;
}

const CategorySchema = new Schema({
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
CategorySchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// インデックス
CategorySchema.index({ slug: 1 });
```

## 3. スレッドモデル (Thread)

各金融機関や話題に関するスレッドを管理するモデルです。

```typescript
interface IThread extends Document {
  title: string;
  author: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  commentCount: number;
}

const ThreadSchema = new Schema({
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

// インデックス
ThreadSchema.index({ category: 1 });
ThreadSchema.index({ author: 1 });
ThreadSchema.index({ createdAt: -1 });
ThreadSchema.index({ commentCount: -1 });
ThreadSchema.index({ title: 'text' });
```

## 4. コメントモデル (Comment)

ユーザーの口コミや意見を管理するモデルです。

```typescript
interface IComment extends Document {
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  thread: mongoose.Schema.Types.ObjectId;
  helpfulCount: number;
  createdAt: Date;
}

const CommentSchema = new Schema({
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

// インデックス
CommentSchema.index({ thread: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ createdAt: -1 });
CommentSchema.index({ helpfulCount: -1 });
CommentSchema.index({ content: 'text' });
```

## 5. 「参考になった」モデル (Helpful)

コメントへの「参考になった」評価を管理するモデルです（重複防止用）。

```typescript
interface IHelpful extends Document {
  user: mongoose.Schema.Types.ObjectId;
  comment: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const HelpfulSchema = new Schema({
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

// 同じユーザーが同じコメントに複数回「参考になった」を付けられないようにする
HelpfulSchema.index({ user: 1, comment: 1 }, { unique: true });
```

## モデル間の関連図

```
User
 ↑
 |
 +-------------------+
 |                   |
 v                   v
Thread             Comment
 ^                   ^
 |                   |
 +                   +
 |                   |
Category          Helpful
```

## データベースインデックス戦略

- **User**: `email`（ユニーク）、`isApproved`（承認ステータスでのフィルタリング用）
- **Category**: `slug`（URLパラメータ用）
- **Thread**: 
  - `category`（カテゴリー別表示用）
  - `createdAt`（新着順表示用）
  - `commentCount`（人気順表示用）
  - `title`（テキスト検索用）
- **Comment**: 
  - `thread`（スレッド別表示用）
  - `createdAt`（新着順表示用）
  - `helpfulCount`（人気順表示用）
  - `content`（テキスト検索用）
- **Helpful**: `user` + `comment`（重複防止用）

## データアクセスパターン

1. ユーザー管理:
   - メールアドレスによるユーザー検索
   - 承認待ちユーザー一覧取得

2. カテゴリー管理:
   - スラッグによるカテゴリー検索
   - 全カテゴリー一覧取得

3. スレッド管理:
   - カテゴリー別スレッド取得
   - 新着順/コメント数順スレッド取得
   - キーワードによるスレッド検索

4. コメント管理:
   - スレッド別コメント取得
   - 新着順/人気順コメント取得
   - ユーザー別コメント取得
   - キーワードによるコメント検索

5. 「参考になった」管理:
   - ユーザーとコメントの組み合わせによる検索（重複防止）
   - コメント別「参考になった」カウント更新 