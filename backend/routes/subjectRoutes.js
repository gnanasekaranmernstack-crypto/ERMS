import express from 'express';
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSubjects)
  .post(protect, createSubject);

router.route('/:id')
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

export default router;
