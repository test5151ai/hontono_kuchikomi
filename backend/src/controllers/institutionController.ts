import { Request, Response } from 'express';
import FinancialInstitution from '../models/FinancialInstitution';

// 全金融機関の取得
export const getInstitutions = async (req: Request, res: Response) => {
  try {
    // クエリパラメータからフィルタリング条件を取得
    let query;
    const reqQuery = { ...req.query };
    
    // 除外するフィールド
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);
    
    // クエリ文字列の作成
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // データベースクエリの実行
    query = FinancialInstitution.find(JSON.parse(queryStr));
    
    // フィールドの選択
    if (req.query.select) {
      const fields = (req.query.select as string).split(',').join(' ');
      query = query.select(fields);
    }
    
    // ソート
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // ページネーション
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await FinancialInstitution.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // レビューの関連データを取得
    if (req.query.populate) {
      query = query.populate('reviews');
    }
    
    // クエリの実行
    const institutions = await query;
    
    // ページネーション結果の作成
    const pagination: any = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: institutions.length,
      pagination,
      data: institutions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};

// 特定の金融機関の取得
export const getInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await FinancialInstitution.findById(req.params.id).populate('reviews');
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: '金融機関が見つかりません'
      });
    }
    
    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
};

// 金融機関の作成（管理者のみ）
export const createInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await FinancialInstitution.create(req.body);
    
    res.status(201).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
};

// 金融機関の更新（管理者のみ）
export const updateInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await FinancialInstitution.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: '金融機関が見つかりません'
      });
    }
    
    res.status(200).json({
      success: true,
      data: institution
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
};

// 金融機関の削除（管理者のみ）
export const deleteInstitution = async (req: Request, res: Response) => {
  try {
    const institution = await FinancialInstitution.findById(req.params.id);
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        error: '金融機関が見つかりません'
      });
    }
    
    await institution.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
}; 