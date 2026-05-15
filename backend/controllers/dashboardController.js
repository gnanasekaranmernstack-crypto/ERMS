import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalExams = await Exam.countDocuments();
  const upcomingExamsCount = await Exam.countDocuments({ status: 'Upcoming' });
  const completedExamsCount = await Exam.countDocuments({ status: 'Completed' });
  const latestResultCount = await Result.countDocuments();

  // Upcoming exams for list
  const upcomingExams = await Exam.find({ status: 'Upcoming' })
    .sort({ examDate: 1 })
    .limit(5);

  // Charts data
  // 1. Exams per month
  const examsPerMonth = await Exam.aggregate([
    {
      $group: {
        _id: { $month: '$examDate' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // 2. Department-wise exams
  const departmentExams = await Exam.aggregate([
    {
      $group: {
        _id: '$department',
        count: { $sum: 1 },
      },
    },
  ]);

  // 3. Upcoming exams trend (by date)
  const upcomingTrend = await Exam.find({ status: 'Upcoming' })
    .sort({ examDate: 1 })
    .limit(10)
    .select('examDate subjectName');

  res.json({
    stats: {
      totalExams,
      upcomingExamsCount,
      completedExamsCount,
      latestResultCount,
    },
    upcomingExams,
    charts: {
      examsPerMonth: examsPerMonth.map((item) => ({
        month: new Date(2026, item._id - 1).toLocaleString('default', { month: 'short' }),
        count: item.count,
      })),
      departmentExams: departmentExams.map((item) => ({
        name: item._id,
        value: item.count,
      })),
      upcomingTrend: upcomingTrend.map((item) => ({
        date: item.examDate.toLocaleDateString(),
        subject: item.subjectName,
        count: 1 // Simple trend
      })),
    },
  });
});

export { getDashboardStats };
