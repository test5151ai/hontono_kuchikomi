import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hontono_kuchikomi';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions;

    await mongoose.connect(mongoUri, options);
    
    console.log('MongoDB接続成功');
    
    // エラーイベントのハンドリング
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB接続エラー:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDBから切断されました');
    });

    // アプリケーション終了時の処理
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB接続を終了しました');
      process.exit(0);
    });

  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

export default connectDB; 