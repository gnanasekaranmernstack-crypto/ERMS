import mongoose from 'mongoose';

const resultSchema = mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

const Result = mongoose.model('Result', resultSchema);

export default Result;
