import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/bookController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getBooks).post(protect, createBook);
router
  .route('/:id')
  .get(protect, getBookById)
  .put(protect, updateBook)
  .delete(protect, deleteBook);

export default router;
