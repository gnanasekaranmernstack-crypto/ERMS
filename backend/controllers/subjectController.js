import asyncHandler from 'express-async-handler';
import Subject from '../models/Subject.js';

// @desc    Get all subjects
const getSubjects = asyncHandler(async (req, res) => {
  const semester = req.query.semester ? { semester: Number(req.query.semester) } : {};
  const department = req.query.department ? { department: req.query.department } : {};
  
  const subjects = await Subject.find({ ...semester, ...department })
    .sort({ semester: 1, subjectName: 1 })
    .lean();

  res.json(subjects);
});

// @desc    Create a subject
const createSubject = asyncHandler(async (req, res) => {
  const { subjectName, subjectCode, type, semester, department } = req.body;

  const subject = new Subject({
    subjectName,
    subjectCode,
    type,
    semester: Number(semester),
    department,
    createdBy: req.user._id
  });

  const createdSubject = await subject.save();
  res.status(201).json(createdSubject);
});

// @desc    Update a subject
const updateSubject = asyncHandler(async (req, res) => {
  const { subjectName, subjectCode, type, semester, department } = req.body;

  const subject = await Subject.findById(req.params.id);

  if (subject) {
    subject.subjectName = subjectName || subject.subjectName;
    subject.subjectCode = subjectCode || subject.subjectCode;
    subject.type = type || subject.type;
    subject.semester = semester ? Number(semester) : subject.semester;
    subject.department = department || subject.department;

    const updatedSubject = await subject.save();
    res.json(updatedSubject);
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

// @desc    Delete a subject
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (subject) {
    await subject.deleteOne();
    res.json({ message: 'Subject removed' });
  } else {
    res.status(404);
    throw new Error('Subject not found');
  }
});

export { getSubjects, createSubject, updateSubject, deleteSubject };
