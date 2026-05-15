import express from 'express';
import {
  getQuestionBanks,
  createQuestionBank,
  updateQuestionBank,
  deleteQuestionBank,
} from '../controllers/questionBankController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getQuestionBanks)
  .post(protect, upload.single('image'), createQuestionBank);

router.route('/:id')
  .put(protect, upload.single('image'), updateQuestionBank)
  .delete(protect, deleteQuestionBank);

export default router;
