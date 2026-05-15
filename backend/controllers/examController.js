import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';

// @desc    Get all exams
const getExams = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 10;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? {
        subjectName: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const department = req.query.department ? { department: req.query.department } : {};
  const semester = req.query.semester ? { semester: req.query.semester } : {};
  const category = req.query.category ? { category: req.query.category } : {};
  const status = req.query.status ? { status: req.query.status } : {};
  const userFilter = { user: req.user._id };

  const count = await Exam.countDocuments({ ...keyword, ...department, ...semester, ...category, ...status, ...userFilter });
  const exams = await Exam.find({ ...keyword, ...department, ...semester, ...category, ...status, ...userFilter })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ examDate: 1 })
    .lean();

  res.json({ exams, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Get exam by ID
const getExamById = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (exam) {
    res.json(exam);
  } else {
    res.status(404);
    throw new Error('Exam not found');
  }
});

// @desc    Create an exam
const createExam = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    department,
    semester,
    examDate,
    startTime,
    endTime,
    examType,
    session,
    category
  } = req.body;

  const exam = new Exam({
    user: req.user._id,
    subjectName,
    subjectCode,
    department,
    semester,
    examDate,
    startTime,
    endTime,
    examType,
    session,
    category
  });

  const createdExam = await exam.save();
  res.status(201).json(createdExam);
});

// @desc    Update an exam
const updateExam = asyncHandler(async (req, res) => {
  const {
    subjectName,
    subjectCode,
    department,
    semester,
    examDate,
    startTime,
    endTime,
    examType,
    session,
    status,
    category
  } = req.body;

  const exam = await Exam.findById(req.params.id);

  if (exam) {
    exam.subjectName = subjectName || exam.subjectName;
    exam.subjectCode = subjectCode || exam.subjectCode;
    exam.department = department || exam.department;
    exam.semester = semester || exam.semester;
    exam.examDate = examDate || exam.examDate;
    exam.startTime = startTime || exam.startTime;
    exam.endTime = endTime || exam.endTime;
    exam.examType = examType || exam.examType;
    exam.session = session || exam.session;
    exam.status = status || exam.status;
    exam.category = category || exam.category;

    const updatedExam = await exam.save();
    res.json(updatedExam);
  } else {
    res.status(404);
    throw new Error('Exam not found');
  }
});

// @desc    Delete an exam
const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findById(req.params.id);
  if (exam) {
    await exam.deleteOne();
    res.json({ message: 'Exam removed' });
  } else {
    res.status(404);
    throw new Error('Exam not found');
  }
});

export { getExams, getExamById, createExam, updateExam, deleteExam };
