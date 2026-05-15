import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBooks)
  .post(protect, upload.single('image'), createBook);

router.route('/:id')
  .get(protect, getBookById)
  .put(protect, upload.single('image'), updateBook)
  .delete(protect, deleteBook);

export default router;
