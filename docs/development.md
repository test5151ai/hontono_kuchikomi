# 開発者向けドキュメント

## 1. 開発環境のセットアップ

### 必要条件
- Node.js (v16以上)
- npm (v7以上)
- MongoDB (v4.4以上)

### プロジェクトのクローン
```bash
git clone https://github.com/yourusername/hontono_kuchikomi.git
cd hontono_kuchikomi
```

### バックエンドのセットアップ
```bash
cd backend
npm install
```

`.env`ファイルをプロジェクトのルートに作成し、以下の内容を追加してください：
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hontono_kuchikomi
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
```

### フロントエンドのセットアップ
```bash
cd frontend
npm install
```

## 2. 開発サーバーの起動

### バックエンド
```bash
cd backend
npm run dev
```

バックエンドサーバーはデフォルトで http://localhost:5000 で起動します。

### フロントエンド
```bash
cd frontend
npm run dev
```

フロントエンドサーバーはデフォルトで http://localhost:3000 で起動します。

## 3. プロジェクト構造

### バックエンド (Node.js/Express)

```
backend/
├── src/
│   ├── config/         # 設定ファイル
│   ├── controllers/    # API制御ロジック
│   ├── middleware/     # ミドルウェア（認証など）
│   ├── models/         # Mongooseモデル
│   ├── routes/         # APIルート定義
│   └── server.ts       # メインサーバーファイル
├── .env                # 環境変数
└── package.json        # 依存関係
```

#### 主要なファイル
- `server.ts`: アプリケーションのエントリーポイント
- `models/`: データモデル（User.ts, FinancialInstitution.ts, Review.ts）
- `controllers/`: ビジネスロジック（authController.ts, institutionController.ts）
- `middleware/auth.ts`: 認証ミドルウェア
- `routes/`: APIエンドポイント（auth.ts, institutions.ts）

### フロントエンド (Next.js/React)

```
frontend/
├── public/             # 静的ファイル
└── src/
    ├── app/            # Next.jsアプリケーション
    │   ├── layout.tsx  # ルートレイアウト
    │   └── page.tsx    # トップページ
    └── components/     # 共通コンポーネント
        ├── Navbar.tsx  # ナビゲーションバー
        └── Footer.tsx  # フッター
```

## 4. 開発ワークフロー

### 新機能の追加
1. 新しいブランチを作成: `git checkout -b feature/機能名`
2. コードを変更
3. テスト: `npm test`
4. コードを整形: `npm run lint`
5. コミット: `git commit -m "機能の説明"`
6. プッシュ: `git push origin feature/機能名`
7. プルリクエストを作成

### バックエンドの開発
- 新しいモデルを追加する場合は `src/models/` ディレクトリに追加
- 新しいAPIエンドポイントを追加する場合は:
  1. `src/controllers/` にコントローラーを作成
  2. `src/routes/` にルートを定義
  3. `src/server.ts` にルーターを登録

### フロントエンドの開発
- 新しいページを追加する場合は `src/app/` ディレクトリに追加
- 共通コンポーネントは `src/components/` ディレクトリに追加
- Bootstrapのコンポーネントを使用してUIを構築

## 5. TypeScriptエラー対応

現在、以下のTypeScriptエラーが存在しています：

### User.tsの`jwt.sign`関数
```typescript
// 修正前
return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'secret', {
  expiresIn: process.env.JWT_EXPIRE || '30d'
});

// 修正後
return jwt.sign(
  { id: this._id },
  process.env.JWT_SECRET || 'secret',
  { expiresIn: process.env.JWT_EXPIRE || '30d' }
);
```

### Review.tsの`post('remove')`メソッド
```typescript
// 修正前
ReviewSchema.post('remove', function() {
  this.constructor.getAverageRating(this.institution);
});

// 修正後
ReviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.getAverageRating(this.institution);
});
```

### ルート定義の戻り値の型
Expressルーターの型定義の問題は、以下のように関数の型を調整することで対応できます：

```typescript
// middlewareの型を修正
import { Request, Response, NextFunction } from 'express';
import { RequestHandler } from 'express-serve-static-core';

// 例: protect関数の型を修正
export const protect: RequestHandler = async (req, res, next) => {
  // 実装
};
```

## 6. デプロイメント

### バックエンド
1. `npm run build` でTypeScriptをコンパイル
2. 本番環境で `.env` ファイルを設定
3. `npm start` でサーバーを起動

### フロントエンド
1. `npm run build` で静的ファイルを生成
2. 生成された `.next` ディレクトリをホスティングサービスにデプロイ

### 推奨ホスティングサービス
- バックエンド: Heroku, DigitalOcean, AWS
- フロントエンド: Vercel, Netlify, AWS Amplify
- データベース: MongoDB Atlas

## 7. 補足情報

### APIテスト
APIのテストには Postman や curl コマンドを使用できます。例：

```bash
# ユーザー登録
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"山田太郎", "email":"yamada@example.com", "password":"password123"}'
```

### 便利なスクリプト
- `backend/package.json` に以下のスクリプトが定義されています：
  - `npm run dev`: 開発サーバーの起動
  - `npm run build`: TypeScriptのコンパイル
  - `npm start`: 本番サーバーの起動

### コードの品質管理
- コードの一貫性のために ESLint と Prettier を使用することを推奨
- コミット前にテストを実行
- コードレビューを実施 