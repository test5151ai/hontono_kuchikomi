import express from 'express';
import {
  getInstitutions,
  getInstitution,
  createInstitution,
  updateInstitution,
  deleteInstitution
} from '../controllers/institutionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

// 公開ルート
router.route('/').get(getInstitutions);
router.route('/:id').get(getInstitution);

// 認証が必要なルート
router.route('/').post(protect, authorize('admin'), createInstitution);
router
  .route('/:id')
  .put(protect, authorize('admin'), updateInstitution)
  .delete(protect, authorize('admin'), deleteInstitution);

export default router;