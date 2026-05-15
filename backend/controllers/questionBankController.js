import asyncHandler from 'express-async-handler';
import QuestionBank from '../models/QuestionBank.js';
import path from 'path';
import fs from 'fs';

// @desc    Get all question banks
const getQuestionBanks = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  
  let query = {};

  if (req.query.keyword) {
    query.$or = [
      { subjectName: { $regex: req.query.keyword, $options: 'i' } },
      { subjectCode: { $regex: req.query.keyword, $options: 'i' } }
    ];
  }

  if (req.query.semester) {
    query.semester = Number(req.query.semester);
  }

  const count = await QuestionBank.countDocuments(query);
  const qbs = await QuestionBank.find(query)
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 })
    .lean();

  res.json({ qbs, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Create a question bank
const createQuestionBank = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    authors,
    regulation,
    semester,
    department,
    link
  } = req.body;

  const image = req.file ? `/uploads/${req.file.filename}` : '';

  const qb = new QuestionBank({
    subjectName,
    subjectCode,
    authors,
    regulation,
    image,
    semester: Number(semester),
    department,
    link,
    createdBy: req.user._id
  });

  const createdQb = await qb.save();
  res.status(201).json(createdQb);
});

// @desc    Update a question bank
const updateQuestionBank = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    authors,
    regulation,
    semester,
    department,
    link
  } = req.body;

  const qb = await QuestionBank.findById(req.params.id);

  if (qb) {
    qb.subjectName = subjectName || qb.subjectName;
    qb.subjectCode = subjectCode || qb.subjectCode;
    qb.authors = authors || qb.authors;
    qb.regulation = regulation || qb.regulation;
    qb.semester = semester ? Number(semester) : qb.semester;
    qb.department = department || qb.department;
    qb.link = link || qb.link;

    if (req.file) {
      if (qb.image) {
        const oldPath = path.join(path.resolve(), qb.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      qb.image = `/uploads/${req.file.filename}`;
    }

    const updatedQb = await qb.save();
    res.json(updatedQb);
  } else {
    res.status(404);
    throw new Error('Question Bank not found');
  }
});

// @desc    Delete a question bank
const deleteQuestionBank = asyncHandler(async (req, res) => {
  const qb = await QuestionBank.findById(req.params.id);
  if (qb) {
    if (qb.image) {
      const imgPath = path.join(path.resolve(), qb.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    await qb.deleteOne();
    res.json({ message: 'Question Bank removed' });
  } else {
    res.status(404);
    throw new Error('Question Bank not found');
  }
});

export { getQuestionBanks, createQuestionBank, updateQuestionBank, deleteQuestionBank };
