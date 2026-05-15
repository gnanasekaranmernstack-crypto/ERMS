import express from 'express';
import {
  getResults,
  getResultById,
  createResult,
  updateResult,
  deleteResult,
} from '../controllers/resultController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getResults).post(protect, createResult);
router
  .route('/:id')
  .get(protect, getResultById)
  .put(protect, updateResult)
  .delete(protect, deleteResult);

export default router;
