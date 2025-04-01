# 本当の口コミ - 金融機関レビューサイト

## プロジェクト概要
このプロジェクトは、金融機関（銀行、証券会社、保険会社など）に関するユーザーレビューを共有するプラットフォームです。ユーザーは金融機関の情報を閲覧し、口コミを投稿・評価することができます。

## 技術スタック
- **フロントエンド**: Next.js (React), Bootstrap 5
- **バックエンド**: Node.js (Express)
- **データベース**: MongoDB
- **認証**: JWT (JSON Web Token)

## ディレクトリ構造

```
hontono_kuchikomi/
├── frontend/                # Next.jsフロントエンド
│   ├── public/              # 静的ファイル
│   └── src/
│       ├── app/             # Nextページコンポーネント
│       └── components/      # 共通コンポーネント
│
└── backend/                 # Expressバックエンド
    ├── src/
    │   ├── config/          # 設定ファイル
    │   ├── controllers/     # コントローラー
    │   ├── middleware/      # ミドルウェア
    │   ├── models/          # データモデル
    │   └── routes/          # APIルート
    ├── .env                 # 環境変数
    └── package.json         # 依存関係
```

## データモデル

### User (ユーザー)
- name: ユーザー名
- email: メールアドレス
- password: パスワード
- role: ロール（user/admin）
- createdAt: 作成日時

### FinancialInstitution (金融機関)
- name: 金融機関名
- type: 種類（bank/securities/insurance/credit_union/other）
- description: 説明
- location: 所在地
- website: Webサイト
- logo: ロゴ画像
- avgRating: 平均評価（1-5）
- reviewCount: レビュー数
- createdAt: 作成日時

### Review (レビュー)
- title: タイトル
- text: レビュー内容
- rating: 評価（1-5）
- user: ユーザーID（参照）
- institution: 金融機関ID（参照）
- createdAt: 作成日時

## API エンドポイント

### 認証関連
- `POST /api/auth/register`: ユーザー登録
- `POST /api/auth/login`: ログイン
- `GET /api/auth/logout`: ログアウト
- `GET /api/auth/me`: 現在のユーザー情報取得

### 金融機関関連
- `GET /api/institutions`: 全金融機関取得
- `GET /api/institutions/:id`: 特定の金融機関取得
- `POST /api/institutions`: 金融機関作成（管理者のみ）
- `PUT /api/institutions/:id`: 金融機関更新（管理者のみ）
- `DELETE /api/institutions/:id`: 金融機関削除（管理者のみ）

## フロントエンドページ (現在実装済み)
- ホームページ: `/`
- 金融機関一覧ページ: `/institutions` (リンクのみ)
- ログイン・新規登録ページ: `/login`, `/register` (リンクのみ)
- サイト情報ページ: `/about` (リンクのみ)

## 実行方法

### バックエンド
```bash
cd backend
npm install
npm run dev
```
サーバーはデフォルトでポート5000で起動します。

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```
フロントエンドはデフォルトでポート3000で起動します。

## 今後の開発計画
1. フロントエンド
   - 金融機関一覧ページの実装
   - 金融機関詳細ページの実装
   - ログイン・新規登録フォームの実装
   - レビュー投稿フォームの実装

2. バックエンド
   - TypeScriptエラーの修正
   - レビュー関連のAPIエンドポイント実装
   - ファイルアップロード機能の実装

3. 機能拡張
   - 金融機関の検索・フィルタリング機能
   - レビューのいいね機能
   - ユーザープロフィールページ
   - 管理者ダッシュボード

## 既知の問題点
- TypeScriptのコンパイルエラー：型定義に関する問題があります
  - User.tsの`jwt.sign`関数
  - Review.tsの`post('remove')`メソッド
  - ルート定義での戻り値の型

## メンテナンス
- データベースのバックアップ手順（未実装）
- 定期的なセキュリティアップデート
- パフォーマンスモニタリング 