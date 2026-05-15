import mongoose from 'mongoose';

const examSchema = mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    examDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      required: true,
      enum: ['Theory', 'Laboratory'],
      default: 'Theory',
    },
    session: {
      type: String,
      required: true,
      enum: ['F.N', 'A.N'],
      default: 'F.N',
    },
    category: {
      type: String,
      required: true,
      enum: ['Semester', 'Arrear'],
      default: 'Semester',
    },
    status: {
      type: String,
      required: true,
      enum: ['Upcoming', 'Completed'],
      default: 'Upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically mark exam as completed if date is passed
examSchema.pre('save', function () {
  const now = new Date();
  if (this.examDate < now) {
    this.status = 'Completed';
  } else {
    this.status = 'Upcoming';
  }
});

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
