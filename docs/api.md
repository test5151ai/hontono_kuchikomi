# 金融機関口コミサイト API仕様書

このドキュメントでは、金融機関口コミサイト「本当の口コミ」のAPI仕様について説明します。

## 基本情報

- **ベースURL**: `http://localhost:5000/api`
- **応答形式**: すべてのAPIはJSON形式で応答します
- **認証**: 多くのエンドポイントではJWTトークンによる認証が必要です

## 認証API

### ユーザー登録

新しいユーザーを登録します。

- **URL**: `/auth/register`
- **メソッド**: `POST`
- **認証**: 不要
- **リクエスト本文**:
  ```json
  {
    "name": "山田太郎",
    "email": "yamada@example.com",
    "password": "password123"
  }
  ```
- **成功レスポンス**:
  - コード: `201 Created`
  - 内容:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### ログイン

登録済みユーザーがログインします。

- **URL**: `/auth/login`
- **メソッド**: `POST`
- **認証**: 不要
- **リクエスト本文**:
  ```json
  {
    "email": "yamada@example.com",
    "password": "password123"
  }
  ```
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

### 現在のユーザー情報取得

現在ログインしているユーザーの情報を取得します。

- **URL**: `/auth/me`
- **メソッド**: `GET`
- **認証**: 必要（JWT）
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
        "name": "山田太郎",
        "email": "yamada@example.com",
        "role": "user",
        "createdAt": "2023-04-01T12:00:00.000Z"
      }
    }
    ```

### ログアウト

ユーザーをログアウトします（クッキーからトークンを削除）。

- **URL**: `/auth/logout`
- **メソッド**: `GET`
- **認証**: 不要
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```

## 金融機関API

### 全金融機関の取得

全ての金融機関情報を取得します。クエリパラメータによるフィルタリングが可能です。

- **URL**: `/institutions`
- **メソッド**: `GET`
- **認証**: 不要
- **クエリパラメータ**:
  - `type`: 金融機関タイプでフィルタリング（例: `?type=bank`）
  - `select`: 取得するフィールドを選択（例: `?select=name,avgRating`）
  - `sort`: ソート順を指定（例: `?sort=avgRating`, 降順は `-avgRating`）
  - `page`: ページ番号（デフォルト: 1）
  - `limit`: 1ページあたりの件数（デフォルト: 10）
  - `populate`: レビューデータを含める（例: `?populate=true`）
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "count": 2,
      "pagination": {
        "next": { "page": 2, "limit": 10 }
      },
      "data": [
        {
          "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
          "name": "みずほ銀行",
          "type": "bank",
          "description": "大手メガバンクの一つ",
          "location": "東京都千代田区大手町",
          "website": "https://www.mizuhobank.co.jp",
          "avgRating": 4.2,
          "reviewCount": 156,
          "createdAt": "2023-04-01T12:00:00.000Z"
        },
        {
          "_id": "60a1b2c3d4e5f6a7b8c9d0e2",
          "name": "三井住友銀行",
          "type": "bank",
          "description": "大手メガバンクの一つ",
          "location": "東京都千代田区丸の内",
          "website": "https://www.smbc.co.jp",
          "avgRating": 4.1,
          "reviewCount": 142,
          "createdAt": "2023-04-01T12:00:00.000Z"
        }
      ]
    }
    ```

### 特定の金融機関の取得

IDを指定して特定の金融機関情報を取得します。

- **URL**: `/institutions/:id`
- **メソッド**: `GET`
- **認証**: 不要
- **URLパラメータ**: `id` - 金融機関のID
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60a1b2c3d4e5f6a7b8c9d0e1",
        "name": "みずほ銀行",
        "type": "bank",
        "description": "大手メガバンクの一つ",
        "location": "東京都千代田区大手町",
        "website": "https://www.mizuhobank.co.jp",
        "avgRating": 4.2,
        "reviewCount": 156,
        "createdAt": "2023-04-01T12:00:00.000Z",
        "reviews": [
          {
            "_id": "60a1b2c3d4e5f6a7b8c9d0f1",
            "title": "対応が丁寧",
            "text": "窓口での対応が非常に丁寧で満足しています。",
            "rating": 5,
            "user": "60a1b2c3d4e5f6a7b8c9d0a1",
            "createdAt": "2023-04-05T09:30:00.000Z"
          }
        ]
      }
    }
    ```

### 金融機関の作成（管理者専用）

新しい金融機関情報を作成します。

- **URL**: `/institutions`
- **メソッド**: `POST`
- **認証**: 必要（JWT、管理者権限）
- **リクエスト本文**:
  ```json
  {
    "name": "三菱UFJ銀行",
    "type": "bank",
    "description": "日本最大のメガバンク",
    "location": "東京都千代田区丸の内",
    "website": "https://www.bk.mufg.jp"
  }
  ```
- **成功レスポンス**:
  - コード: `201 Created`
  - 内容:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60a1b2c3d4e5f6a7b8c9d0e3",
        "name": "三菱UFJ銀行",
        "type": "bank",
        "description": "日本最大のメガバンク",
        "location": "東京都千代田区丸の内",
        "website": "https://www.bk.mufg.jp",
        "avgRating": 0,
        "reviewCount": 0,
        "createdAt": "2023-04-10T15:00:00.000Z"
      }
    }
    ```

### 金融機関の更新（管理者専用）

既存の金融機関情報を更新します。

- **URL**: `/institutions/:id`
- **メソッド**: `PUT`
- **認証**: 必要（JWT、管理者権限）
- **URLパラメータ**: `id` - 金融機関のID
- **リクエスト本文**:
  ```json
  {
    "description": "日本を代表するメガバンクの一つ",
    "website": "https://www.bk.mufg.jp/individual/index.html"
  }
  ```
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "data": {
        "_id": "60a1b2c3d4e5f6a7b8c9d0e3",
        "name": "三菱UFJ銀行",
        "type": "bank",
        "description": "日本を代表するメガバンクの一つ",
        "location": "東京都千代田区丸の内",
        "website": "https://www.bk.mufg.jp/individual/index.html",
        "avgRating": 0,
        "reviewCount": 0,
        "createdAt": "2023-04-10T15:00:00.000Z"
      }
    }
    ```

### 金融機関の削除（管理者専用）

金融機関情報を削除します。

- **URL**: `/institutions/:id`
- **メソッド**: `DELETE`
- **認証**: 必要（JWT、管理者権限）
- **URLパラメータ**: `id` - 金融機関のID
- **成功レスポンス**:
  - コード: `200 OK`
  - 内容:
    ```json
    {
      "success": true,
      "data": {}
    }
    ```

## エラーレスポンス

全てのAPIで、エラーが発生した場合は以下の形式でレスポンスが返されます：

```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

主なエラーコード：
- `400 Bad Request`: リクエストが不正
- `401 Unauthorized`: 認証に失敗
- `403 Forbidden`: 権限がない
- `404 Not Found`: リソースが見つからない
- `500 Internal Server Error`: サーバー内部エラー 