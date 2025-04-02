import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import config from './config/config';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import institutionRoutes from './routes/institutions';
import errorHandler from './middleware/error';

// Expressアプリケーションの作成
const app: Express = express();

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// APIルートの設定
app.use('/api/auth', authRoutes);
app.use('/api/institutions', institutionRoutes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// ルートエンドポイント
app.get('/', (req: Request, res: Response) => {
  res.send('金融機関口コミサイト API サーバーが稼働中です');
});

// サーバーの起動
const startServer = async () => {
  try {
    // MongoDBへの接続
    await connectDB();

    app.listen(config.port, () => {
      console.log(`サーバーがポート ${config.port} で起動しました`);
      console.log(`環境: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('サーバーの起動に失敗しました:', error);
    process.exit(1);
  }
};

startServer(); 