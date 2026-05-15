import asyncHandler from 'express-async-handler';
import Book from '../models/Book.js';

// @desc    Get all books
const getBooks = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  
  let query = {};

  if (req.query.keyword) {
    query.$or = [
      { subjectName: { $regex: req.query.keyword, $options: 'i' } },
      { subjectCode: { $regex: req.query.keyword, $options: 'i' } },
      { authors: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  if (req.query.department) {
    query.department = req.query.department;
  }

  if (req.query.semester) {
    query.semester = Number(req.query.semester);
  }

  const count = await Book.countDocuments(query);
  const books = await Book.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 })
    .lean();

  res.json({ books, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get book by ID
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    res.json(book);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Create a book
const createBook = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    authors,
    regulation,
    description,
    semester,
    department,
    link
  } = req.body;

  const book = new Book({
    subjectName,
    subjectCode,
    authors,
    regulation,
    description,
    semester: Number(semester),
    department,
    link,
    createdBy: req.user._id
  });

  const createdBook = await book.save();
  res.status(201).json(createdBook);
});

// @desc    Update a book
const updateBook = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    authors,
    regulation,
    description,
    semester,
    department,
    link
  } = req.body;

  const book = await Book.findById(req.params.id);

  if (book) {
    book.subjectName = subjectName || book.subjectName;
    book.subjectCode = subjectCode || book.subjectCode;
    book.authors = authors || book.authors;
    book.regulation = regulation || book.regulation;
    book.description = description || book.description;
    book.semester = semester ? Number(semester) : book.semester;
    book.department = department || book.department;
    book.link = link || book.link;

    const updatedBook = await book.save();
    res.json(updatedBook);
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

// @desc    Delete a book
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } else {
    res.status(404);
    throw new Error('Book not found');
  }
});

export { getBooks, getBookById, createBook, updateBook, deleteBook };
