import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';
import Result from '../models/Result.js';

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalExams,
    upcomingExamsCount,
    completedExamsCount,
    latestResultCount,
    upcomingExams,
    examsPerMonth,
    departmentExams
  ] = await Promise.all([
    Exam.countDocuments(),
    Exam.countDocuments({ status: 'Upcoming' }),
    Exam.countDocuments({ status: 'Completed' }),
    Result.countDocuments(),
    Exam.find({ status: 'Upcoming' }).sort({ examDate: 1 }).limit(5).lean(),
    Exam.aggregate([
      { $group: { _id: { $month: '$examDate' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Exam.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ])
  ]);

  // 3. Upcoming exams trend (by date) - run this too or use the upcomingExams result
  const upcomingTrend = upcomingExams; // Re-use for simple trend to save a query

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
