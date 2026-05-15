import express from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from '../controllers/examController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getExams).post(protect, createExam);
router
  .route('/:id')
  .get(protect, getExamById)
  .put(protect, updateExam)
  .delete(protect, deleteExam);

export default router;
