import dotenv from 'dotenv';
import path from 'path';

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  nodeEnv: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpire: string;
  jwtCookieExpire: number;
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/hontono_kuchikomi',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  jwtCookieExpire: parseInt(process.env.JWT_COOKIE_EXPIRE || '30', 10)
};

export default config; 