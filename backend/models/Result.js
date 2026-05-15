import mongoose from 'mongoose';

const resultSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    studentName: {
      type: String,
      required: true,
    },
    registerNumber: {
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
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    marks: {
      type: Number,
    },
    grade: {
      type: String,
    },
    resultStatus: {
      type: String,
      required: true,
      enum: ['Pass', 'Fail'],
    },
    category: {
      type: String,
      required: true,
      enum: ['Semester', 'Arrear'],
      default: 'Semester'
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for faster querying
resultSchema.index({ registerNumber: 1 });
resultSchema.index({ department: 1 });
resultSchema.index({ semester: 1 });
resultSchema.index({ category: 1 });
resultSchema.index({ studentName: 'text', subjectName: 'text', subjectCode: 'text' });

const Result = mongoose.model('Result', resultSchema);

export default Result;
