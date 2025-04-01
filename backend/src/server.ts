import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/auth';
import institutionRoutes from './routes/institutions';

// 環境変数の読み込み
dotenv.config();

// Expressアプリケーションの作成
const app: Express = express();
const PORT = process.env.PORT || 5000;

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.send('金融機関口コミサイト API サーバーが稼働中です');
});

// サーバーの起動
const startServer = async () => {
  try {
    // MongoDBへの接続
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hontono_kuchikomi';
    await mongoose.connect(MONGO_URI);
    console.log('MongoDBに接続しました');

    app.listen(PORT, () => {
      console.log(`サーバーがポート ${PORT} で起動しました`);
    });
  } catch (error) {
    console.error('サーバーの起動に失敗しました:', error);
    process.exit(1);
  }
};

startServer(); 