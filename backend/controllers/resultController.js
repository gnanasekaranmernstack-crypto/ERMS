import asyncHandler from 'express-async-handler';
import Result from '../models/Result.js';

// @desc    Get all results
// @route   GET /api/results
// @access  Private
const getResults = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        $or: [
          { studentName: { $regex: req.query.keyword, $options: 'i' } },
          { registerNumber: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const department = req.query.department ? { department: req.query.department } : {};
  const semester = req.query.semester ? { semester: req.query.semester } : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const userFilter = { user: req.user._id };
  
  const count = await Result.countDocuments({ ...keyword, ...department, ...semester, ...category, ...userFilter });
  const results = await Result.find({ ...keyword, ...department, ...semester, ...category, ...userFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 })
    .lean();

  res.json({ results, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get result by ID
// @route   GET /api/results/:id
// @access  Private
const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);

  if (result) {
    res.json(result);
  } else {
    res.status(404);
    throw new Error('Result not found');
  }
});

// @desc    Create a result
// @route   POST /api/results
// @access  Private
const createResult = asyncHandler(async (req, res) => {
  const {
    studentName,
    registerNumber,
    department,
    semester,
    subjectName,
    subjectCode,
    marks,
    grade,
    resultStatus,
    category,
  } = req.body;

  const result = new Result({
    user: req.user._id,
    studentName,
    registerNumber,
    department,
    semester,
    subjectName,
    subjectCode,
    marks,
    grade,
    resultStatus,
    category,
  });

  const createdResult = await result.save();
  res.status(201).json(createdResult);
});

// @desc    Update a result
// @route   PUT /api/results/:id
// @access  Private
const updateResult = asyncHandler(async (req, res) => {
  const {
    studentName,
    registerNumber,
    department,
    semester,
    subjectName,
    subjectCode,
    marks,
    grade,
    resultStatus,
    category,
  } = req.body;

  const result = await Result.findById(req.params.id);

  if (result) {
    result.studentName = studentName || result.studentName;
    result.registerNumber = registerNumber || result.registerNumber;
    result.department = department || result.department;
    result.semester = semester || result.semester;
    result.subjectName = subjectName || result.subjectName;
    result.subjectCode = subjectCode || result.subjectCode;
    result.marks = marks || result.marks;
    result.grade = grade || result.grade;
    result.resultStatus = resultStatus || result.resultStatus;
    result.category = category || result.category;

    const updatedResult = await result.save();
    res.json(updatedResult);
  } else {
    res.status(404);
    throw new Error('Result not found');
  }
});

// @desc    Delete a result
// @route   DELETE /api/results/:id
// @access  Private
const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);

  if (result) {
    await result.deleteOne();
    res.json({ message: 'Result removed' });
  } else {
    res.status(404);
    throw new Error('Result not found');
  }
});

export { getResults, getResultById, createResult, updateResult, deleteResult };
