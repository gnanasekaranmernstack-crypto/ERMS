import mongoose from 'mongoose';

const questionBankSchema = mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
    },
    subjectCode: {
      type: String,
      required: true,
    },
    authors: {
      type: String,
    },
    regulation: {
      type: String,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    link: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const QuestionBank = mongoose.model('QuestionBank', questionBankSchema);

export default QuestionBank;
